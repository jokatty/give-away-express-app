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

  /**
 * callback function to render category page.
 * checks for user login status and sets the nav
 * queries the 'listings' table and fetches products of the the requested categoy.
 */
  const displayCategoryPage = async (req, res) => {
    let nav = '';
    const { userName } = req.cookies;
    if (userName) {
      nav = 'index-loggedin-nav';
    } else {
      nav = 'index-nav';
    }
    // extract params data passed in the route
    const categoryName = req.params.category;
    const category = `${categoryName[0].toUpperCase()}${categoryName.slice(1)}`;
    try {
      const listings = await db.Listing.findAll({
        where: {
          product_category: categoryName,
        },
      });
      res.render('category', {
        productInfo: listings, category, nav, userName,
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send('Internal Server Error');
    }
  };
  return {
    allowListing,
    displayCategoryPage,
  };
}
