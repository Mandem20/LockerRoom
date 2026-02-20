const userModel = require('../../models/userModel')
const sendEmail = require('../../config/sendEmail')

const verifyCustomerEmailTemplate = ({ name }) => {
  return `
    <p>Dear ${name},</p>
    <p>Your account has been verified successfully.</p>
    <p>You now have full access to your LockerRoom account.</p>
    <p>If you did not request this verification, please contact support.</p>
    <br/>
    <p>Best regards,<br/>LockerRoom Team</p>
  `
}

const verifyCustomerController = async (req, res) => {
  try {
    const { email, phone, mobile, sendNotification } = req.body

    if (!email && !phone && !mobile) {
      return res.json({
        message: "Please provide email, phone, or mobile to verify",
        error: true,
        success: false
      })
    }

    const query = {}
    if (email) query.email = email
    if (phone) query.phone = phone
    if (mobile) query.mobile = mobile

    const user = await userModel.findOne(query).select('-password -resetOtp -resetOtpExpiry')

    if (!user) {
      return res.json({
        message: "Customer not found",
        error: true,
        success: false,
        verified: false
      })
    }

    if (!user.isActive) {
      return res.json({
        message: "Customer account is deactivated",
        error: true,
        success: false,
        verified: false,
        isActive: false
      })
    }

    if (sendNotification && user.email) {
      try {
        await sendEmail({
          sendTo: user.email,
          subject: "Account Verified - LockerRoom",
          html: verifyCustomerEmailTemplate({ name: user.name })
        })
      } catch (emailError) {
        console.log("Email send error:", emailError)
      }
    }

    res.json({
      message: "Customer verified successfully",
      success: true,
      error: false,
      verified: true,
      notificationSent: sendNotification && user.email ? true : false,
      customer: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        mobile: user.mobile,
        role: user.role,
        isActive: user.isActive
      }
    })
  } catch (err) {
    res.json({
      message: err.message || "Something went wrong",
      error: true,
      success: false
    })
  }
}

module.exports = verifyCustomerController
