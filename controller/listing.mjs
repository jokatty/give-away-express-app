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

  const createListing = async (req, res) => {
    /**
 * callback function for '/listing' post route.
 * update the listings table with the user input data.
 * use 'multer' for storing user generated data in uploads dir.
 */
    console.log('request came in');
    console.log(req.file);
    const {
      productCategory, productName, productDescription,
    } = req.body;
    const { userId } = req.cookies;
    //  insert the new listing to the listing table
    const newListing = await db.Listing.create({
      productCategory,
      productName,
      productDescription,
      productImageInfo: req.file.filename,
      userId,
      isAvailable: true,
    });

    // query the listing table for all listing where category is this particular category
    // TODO: this redirect logic needs to completed.
    const categoryListing = await db.Listing.findAll({
      where: {
        product_category: productCategory,
      },
    });
    console.log(categoryListing);
    const category = `${productCategory[0].toUpperCase()}${productCategory.slice(1)}`;
    // to direct user to the product category page they posted
    // res.render('category', { productInfo: categoryListing, category });
    res.redirect('/dashboard/added-product');
  };
  return {
    allowListing,
    displayCategoryPage,
    createListing,
  };
}
