import moment from 'moment';

export default function initProductController(db) {
  /**
 * callback function for '/request-item'.
 * checks for user logged in status.
 * fetches requested product's information from route params
 * updates the 'requests' table in db with the new requests.
 */
  const requestProduct = async (req, res) => {
    if (!req.cookies.isLoggedIn) {
      res.cookie('requestItem', 'true');
      res.render('guest-user');
      return;
    }
    // params passes the listing_id
    const { productInfo } = req.params;
    console.log(productInfo);
    const listingId = productInfo;
    const { userId } = req.cookies;
    try {
      const request = await db.Request.create({
        listingId,
        userId,
      });
      res.render('request-confirmation');
    } catch (err) {
      console.log(err.stack);
      res.status(500).send('Internal Server Error');
    }
  };

  /**
 * callback function for '/product/:id' route
 * renders complete information about the product
 */
  const renderProductInfo = async (req, res) => {
    let nav = '';
    const { userName } = req.cookies;
    if (userName) {
      nav = 'index-loggedin-nav';
    } else {
      nav = 'index-nav';
    }
    const productId = req.params.id;

    // joining users table with listings table to get the user's name
    try {
      const productInfo = await db.Listing.findOne({
        where: {
          id: productId,
        },
        include: [
          {
            model: db.User,
          },
        ],
      });
      console.log(productInfo);
      const date = moment(productInfo.createdAt).fromNow();
      res.render('product', {
        productInfo, nav, userName, date, productId,
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send('Internal Server Error');
    }
  };
  return {
    requestProduct,
    renderProductInfo,
  };
}
