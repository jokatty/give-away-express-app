export default function initDeleteController(db) {
  /**
 * callback function for '/delete' route
 * delete the product from the listings table and request table in db.
 * check the params to see if the product deleting request coming from is added or requested tabs.
 */
  const handleDeleteReq = async (req, res) => {
    const productId = parseInt(req.body.productId, 10);
    if (req.params.item === 'added-product') {
      // check  if the product id is in the request table.
      // If yes then delete the product from request table first before deleting from listing table.
      // if product id does not exist in request table then  delete only from the listing table
      const productExist = await db.Request.findOne({
        where: {
          listingId: productId,
        },
      });
      if (productExist) {
        try {
          await db.Request.destroy({
            where: {
              listingId: productId,
            },
          });
          await db.Listing.destroy({
            where: {
              id: productId,
            },
          });
          res.redirect('/dashboard/added-product');
        } catch (err) {
          console.log(err.stack);
          res.status(500).send('Internal Server Error');
        }
      } else {
        try {
          await db.Listing.destroy({
            where: {
              id: productId,
            },
          });
          res.redirect('/dashboard/added-product');
        } catch (err) {
          console.log(err.stack);
          res.status(500).send('Internal Server Error');
        }
      }
    } else if (req.params.item === 'requested-product') {
      // Note: old code was deleteing the product from the listing table. which does not seem right.
      // updated to delete only from request table.
      // delete from request table
      try {
        await db.Request.destroy({
          where: {
            // listing_id is a fk in request table.
            listingId: productId,
          },
        });
        res.redirect('/dashboard/request');
      } catch (err) {
        console.log(err.stack);
        res.status(500).send('Internal Server Error');
      }
    }
  };
  return {
    handleDeleteReq,
  };
}
