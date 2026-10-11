import './Navbar.css'
import PropTypes from 'prop-types'
import { assets } from '../../assets/assets'

const Navbar = ({ onLogout }) => {
  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="" />
      <button className='navbar-logout' type="button" onClick={onLogout}>Sign out</button>
    </div>
  )
}

Navbar.propTypes = {
  onLogout: PropTypes.func.isRequired,
}

export default Navbar
