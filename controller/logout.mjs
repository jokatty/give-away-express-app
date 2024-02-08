/**
 * callback function for '/logout' post route
 * clear cookies to log out the user.
 * render logout confirmation page.
 */
export default function initLogoutController() {
  const handleLogOut = async (req, res) => {
    res.clearCookie('userName');
    res.clearCookie('isLoggedIn');
    res.clearCookie('userId');
    res.render('logout');
  };
  return {
    handleLogOut,
  };
}
