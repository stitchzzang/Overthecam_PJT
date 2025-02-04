import NavBar from "./NavBar";

function HeaderLayout({children}) {
    return (
        <>
        <NavBar/>
        <main>{children}</main>
        </>
    )
}

export default HeaderLayout;