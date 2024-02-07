import moment from 'moment';

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

  /**
 * callback function for 'dashboard/:type'.
 * based on route param 'type' renders either all requests or all added-items page.
 */

  const renderCustomDashboard = async (req, res) => {
    if (req.params.type === 'request') {
      const { userId, userName } = req.cookies;
      try {
        const requestedItems = await db.Listing.findAll({
          include: [
            {
              model: db.Request,
              where: {
                userId,
              },
            },
          ],
        });
        const date = requestedItems.map((listing) => (moment(listing.createdAt).from()));
        res.render('dashboard-request', { requestedProducts: requestedItems, userName, date });
      } catch (err) {
        console.log(err);
        return err;
      }
    }
    if (req.params.type === 'added-product') {
      const { userId, userName } = req.cookies;
      try {
        const listedItems = await db.Listing.findAll({
          where: {
            userId,
          },
        });
        const date = listedItems.map((listing) => (moment(listing.createdAt).from()));
        res.render('dashboard-added-product', { listedProducts: listedItems, userName, date });
      } catch (err) {
        console.log(err);
        return err;
      }
    }
  };

  return {
    renderUserDashboard,
    renderCustomDashboard,
  };
}
