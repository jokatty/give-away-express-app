export default function initIndexController() {
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
