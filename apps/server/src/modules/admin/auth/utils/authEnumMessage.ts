export enum AuthEnumMessage {
    // not found
    notFoundEmail = "Find email not found",
    notFound = "Find not found",
    notSameSystem = "The system is not the same",

    // not verified

    notVerifiedEmail = "Email not verified",

    // already
    alreadyEmail = "Email already existing",
    alreadySignIn = "You already signin",


    // disabled
    disabledAccount = "Your account has been disabled",

    // required
    requiredSessionToken = "Session token is required",
    requiredSessionInfo = "Session data is required",
    requiredEmail = "Email is required",
    requiredBody = "Body data is required",

    // unauthorized
    unauthorized = "Unauthorized",

    // expired
    expiredSessionToken = "Session token expired",

    // incorrect
    incorrectPassword = "Incorrect password",

    // success
    successSignin = "Sign in successfully",
    successSignout = "Sign out successfully",
    successSignup = "Sign up successfully",
    successSendOTP = "Send OTP successfully",
    successVerifiedOTP = "Verified OTP code successfully",

    // error
}