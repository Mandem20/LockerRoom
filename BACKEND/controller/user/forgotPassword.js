const userModel = require('../../models/userModel')

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.json({
        message: "Email is required",
        error: true,
        success: false
      })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({
        message: "User not found with this email",
        error: true,
        success: false
      })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = Date.now() + 10 * 60 * 1000

    await userModel.findByIdAndUpdate(user._id, {
      resetOtp: otp,
      resetOtpExpiry: otpExpiry
    })

    console.log("OTP for password reset:", otp)
    console.log("OTP will expire at:", new Date(otpExpiry))

    res.json({
      message: "OTP sent to your email",
      success: true,
      error: false
    })
  } catch (err) {
    res.json({
      message: err.message || "Something went wrong",
      error: true,
      success: false
    })
  }
}

const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.json({
        message: "Email and OTP are required",
        error: true,
        success: false
      })
    }

    const user = await userModel.findOne({ email, resetOtp: otp })

    if (!user) {
      return res.json({
        message: "Invalid OTP",
        error: true,
        success: false
      })
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.json({
        message: "OTP has expired",
        error: true,
        success: false
      })
    }

    res.json({
      message: "OTP verified successfully",
      success: true,
      error: false
    })
  } catch (err) {
    res.json({
      message: err.message || "Something went wrong",
      error: true,
      success: false
    })
  }
}

const resetPasswordController = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.json({
        message: "Email, OTP and new password are required",
        error: true,
        success: false
      })
    }

    const user = await userModel.findOne({ email, resetOtp: otp })

    if (!user) {
      return res.json({
        message: "Invalid OTP",
        error: true,
        success: false
      })
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.json({
        message: "OTP has expired",
        error: true,
        success: false
      })
    }

    await userModel.findByIdAndUpdate(user._id, {
      password: newPassword,
      resetOtp: null,
      resetOtpExpiry: null
    })

    res.json({
      message: "Password reset successfully",
      success: true,
      error: false
    })
  } catch (err) {
    res.json({
      message: err.message || "Something went wrong",
      error: true,
      success: false
    })
  }
}

module.exports = {
  forgotPasswordController,
  verifyOtpController,
  resetPasswordController
}
