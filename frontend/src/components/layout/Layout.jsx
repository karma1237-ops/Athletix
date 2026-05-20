import Header from "./Header";
import Footer from "./Footer";

/**
 * Layout principal — enveloppe toutes les pages avec Header + Footer.
 * Usage :
 *   <Layout>
 *     <MonContenu />
 *   </Layout>
 *
 * Props :
 *   - noFooter : boolean — masque le footer (ex : pages auth)
 */
export default function Layout({ children, noFooter = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#111" }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}
