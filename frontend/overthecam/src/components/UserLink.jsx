import { Link } from "react-router-dom"

function UserLink({ userId, children }) {
  return <Link to={`/user-profile/${userId}`}>{children}</Link>
}

export default UserLink

