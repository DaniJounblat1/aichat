import { SessionProvider } from "next-auth/react";
import "../styles/global.scss"; // Adjust path as needed

function MyApp({ Component, pageProps }) {
    return (
        <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
}

export default MyApp;
