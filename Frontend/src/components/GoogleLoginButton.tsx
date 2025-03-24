import { GoogleLogin } from '@react-oauth/google';


interface GoogleLoginButtonProps {
    onSuccess: (credentialResponse: any) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess }) => {
    return (
        <div style={{ marginTop: '10px' }}>
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    console.log("✅ Login Success:", credentialResponse);
                    onSuccess(credentialResponse);
                }}
                onError={() => {
                    console.log("❌ Login Failed");
                }}
            />
        </div>
    );
};

export default GoogleLoginButton;