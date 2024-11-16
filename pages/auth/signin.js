import { useSession } from "next-auth/react";

const Home = () => {
    const { data: session } = useSession();

    if (!session) {
        return (
            <button onClick={() => signIn("google")}>
                Sign in with Google
            </button>
        );
    }

    return (
        <div>
            <h1>Welcome {session.user.name}</h1>
            <button onClick={() => signOut()}>Sign out</button>
        </div>
    );
};
