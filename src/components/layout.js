import Header from "./header";
import Footer from "./footer";

function Layout(props) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-screen mx-auto md:px-0 w-full">
        {props.children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
