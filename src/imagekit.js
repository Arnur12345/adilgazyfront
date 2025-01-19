import ImageKit from 'imagekit-javascript';

const imagekit = new ImageKit({
    publicKey: "public_hyUl5uCyouURSunEH+4EYZHw6/M=",
    urlEndpoint: "https://ik.imagekit.io/or0fxw60t",
    authenticationEndpoint: "http://localhost:5000/api/imagekit/auth"
});

export default imagekit;