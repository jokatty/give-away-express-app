export default function initRequestProductController(db) {
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
  return {
    requestProduct,
  };
}
