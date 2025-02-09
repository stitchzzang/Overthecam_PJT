import { Link } from "react-router-dom"

function UserProfileLink({ userId, children }) {
  return <Link to={`/user-profile/${userId}`}>{children}</Link>
}

export default UserProfileLink

