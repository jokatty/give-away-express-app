export default function initIndexController() {
  /**
 * callback function for '/' route. renders index page.
 * check for the userName cookie. if cookie existes set the nav bar for the loggedin user.
 * else set the nav for guest users.
 * @param {string} req - route's request.
 * @param {string} res - route's response.
 */
  const index = async (req, res) => {
    const { userName } = req.cookies;
    let nav;
    let redirectLink;
    let redirectText;
    if (userName) {
      nav = 'index-loggedin-nav';
      redirectLink = '/dashboard';
      redirectText = 'User dashboard';
    } else {
      nav = 'index-nav';
      redirectLink = '/register';
      redirectText = 'Sign up';
    }
    res.render('index', {
      nav, userName, redirectText, redirectLink,
    });
  };
  return {
    index,
  };
}
