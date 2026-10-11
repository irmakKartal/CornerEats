import { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token ,setToken, food_list, searchQuery, setSearchQuery } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const scrollToSection = (sectionId, menuName) => {
    setMenu(menuName);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate('/')
  }

  const filteredFoodCount = food_list.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  ).length;

  return (
    <div className='navbar'>
      <Link to='/' onClick={() => setMenu("home")}><img className='logo' src={assets.logo} alt="" /></Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => {
            setMenu("home");
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className={`${menu === "home" && location.pathname === "/" ? "active" : ""}`}
        >
          home
        </Link>
        <a
          href='#explore-menu'
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('explore-menu', 'menu');
          }}
          className={`${menu === "menu" && location.pathname === "/" ? "active" : ""}`}
        >
          menu
        </a>
        <a
          href='#app-download'
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('app-download', 'mob-app');
          }}
          className={`${menu === "mob-app" && location.pathname === "/" ? "active" : ""}`}
        >
          mobile app
        </a>
        <a
          href='#footer'
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('footer', 'contact');
          }}
          className={`${menu === "contact" ? "active" : ""}`}
        >
          contact us
        </a>
      </ul>
      <div className="navbar-right">
        <div className="navbar-search">
          <img src={assets.search_icon} alt="Search" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search food"
            aria-label="Search food"
          />
          {searchQuery && <span className="navbar-search-result">{filteredFoodCount}</span>}
        </div>
        <Link to='/cart' className='navbar-search-icon'>
          <img src={assets.basket_icon} alt="" />
          <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
        </Link>
        {!token ? <button onClick={() => setShowLogin(true)}>sign in</button>
          : <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className='navbar-profile-dropdown'>
              <li onClick={()=>navigate('/myorders')}> <img src={assets.bag_icon} alt="" /> <p>Orders</p></li>
              <hr />
              <li onClick={logout}> <img src={assets.logout_icon} alt="" /> <p>Logout</p></li> 
            </ul>
          </div>
        }

      </div>
    </div>
  )
}

Navbar.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
}

export default Navbar
