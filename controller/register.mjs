import jsSHA from 'jssha';

export default function initUserRegistration(db) {
  /**
 * callback function for register post route. fetch user form data and save in db.
 * @param {string} req - route's request.
 * @param {string} res - route's response.
 */
  const createUser = async (req, res) => {
    const { fname, lname, email } = req.body;
    console.log(fname + lname + email);
    // hash user password
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update(req.body.pwd);
    const hashedPassword = shaObj.getHash('HEX');
    try {
      const newUser = await db.User.create({
        firstName: fname,
        lastName: lname,
        email,
        password: hashedPassword,
      });
      res.cookie('isLoggedIn', 'true');
      res.cookie('userName', `${fname}`);
      res.cookie('userId', `${newUser.id}`);
      res.redirect('/listing');
    } catch (err) {
      console.log(err);
    }
  };

  return {
    createUser,
  };
}
