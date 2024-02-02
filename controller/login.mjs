import jsSHA from 'jssha';

export default function initLoginController(db) {
  const handleLogin = async (req, res) => {
    // get the login information from the request body
    const { email, pwd } = req.body;

    // check if the user email exists in the db
    try {
      const user = await db.User.findOne({ where: { email } });
      if (!user) {
        res.status(403).send('login failed');
        return;
      }

      // hash the password
      const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
      shaObj.update(pwd);
      const hashedPassword = shaObj.getHash('HEX');

      // check if the password matches the hashed password
      if (user.password !== hashedPassword) {
        res.status(403).send('login failed');
        return;
      }

      // set the cookies for the user
      res.cookie('isLoggedIn', true);
      res.cookie('userName', `${user.firstName}`);
      res.cookie('userId', `${user.id}`);

      if (req.cookies.requestItem === 'true') {
        res.clearCookie('requestItem');
        res.redirect('/');
        return;
      }

      // Redirect to the appropriate page after successful login
      // if user login request comes from listings page, redirect user back to the page.
      // logic yet to be worked out.
      //  res.redirect('/listing');
      res.redirect('/');
    } catch (err) {
      console.log('Error in executing query:', err.stack);
      res.status(503).send(err);
    }
  };
  return {
    handleLogin,
  };
}
