export default function initListingController(db) {
  /**
 * callback function for '/listing'.
 * checks for cookies. If user is logged in, renders the create listing page.
 * else renders page to prompt user to signup or login.
 */
  const allowListing = async (req, res) => {
    const { isLoggedIn } = req.cookies;
    if (isLoggedIn === 'true') {
      res.render('listing');
    } else {
      res.render('guest-user');
    }
  };
  return {
    allowListing,
  };
}
