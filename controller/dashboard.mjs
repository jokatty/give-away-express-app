export default function initDashboardController(db) {
  /**
 * callback function for '/dashboard' route.
 * renders user's dashboard with the all transactions history.
 * quries listings table and requests table.
 */
  const renderUserDashboard = async (req, res) => {
    const { userId } = req.cookies;
    let nav = '';
    const { userName } = req.cookies;
    if (userName) {
      nav = 'index-loggedin-nav';
    } else {
      nav = 'index-nav';
    }
    try {
      // select all the listing made by the user with userId
      const userListings = await db.Listing.findAll({
        where: {
          userId,
        },
      });
      // select all the listing requested by the user with userId
      const userRequests = await db.Listing.findAll({
        include: [
          {
            model: db.Request,
            where: {
              userId,
            },
          },
        ],
      });
      res.render('dashboard-user', {
        listedProducts: userListings, requestedProducts: userRequests, nav, userName,
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send('Internal Server Error');
    }
  };
  return {
    renderUserDashboard,
  };
}
