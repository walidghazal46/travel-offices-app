package com.travel.offices

import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import java.util.concurrent.TimeUnit

class PhoneAuthActivity : AppCompatActivity() {
  private val tag = "PhoneAuth"
  private lateinit var auth: FirebaseAuth

  private var storedVerificationId: String? = null
  private var resendToken: PhoneAuthProvider.ForceResendingToken? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_phone_auth)

    auth = FirebaseAuth.getInstance()

    val etPhone = findViewById<EditText>(R.id.etPhone)
    val etOtp = findViewById<EditText>(R.id.etOtp)
    val btnSend = findViewById<Button>(R.id.btnSend)
    val btnVerify = findViewById<Button>(R.id.btnVerify)

    btnSend.setOnClickListener {
      val phone = etPhone.text.toString().trim()
      startPhoneVerification(phone)
    }

    btnVerify.setOnClickListener {
      val code = etOtp.text.toString().trim()
      verifyCode(code)
    }
  }

  fun startPhoneVerification(phoneNumber: String) {
    if (!phoneNumber.startsWith("+") || phoneNumber.length < 8) {
      toast("اكتب الرقم بصيغة دولية مثل +20...")
      return
    }

    Log.d(tag, "startPhoneVerification: $phoneNumber")

    val callbacks = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
      override fun onVerificationCompleted(credential: PhoneAuthCredential) {
        Log.d(tag, "onVerificationCompleted: instant/auto-retrieval")
        signInWithPhoneAuthCredential(credential)
      }

      override fun onVerificationFailed(e: FirebaseException) {
        Log.e(tag, "onVerificationFailed: ${e.message}", e)
        toast("فشل التحقق: ${e.message}")
      }

      override fun onCodeSent(
        verificationId: String,
        token: PhoneAuthProvider.ForceResendingToken
      ) {
        Log.d(tag, "onCodeSent: verificationId=$verificationId")
        storedVerificationId = verificationId
        resendToken = token
        toast("تم إرسال الكود")
      }
    }

    val options = PhoneAuthOptions.newBuilder(auth)
      .setPhoneNumber(phoneNumber)
      .setTimeout(60L, TimeUnit.SECONDS)
      .setActivity(this)
      .setCallbacks(callbacks)
      .build()

    PhoneAuthProvider.verifyPhoneNumber(options)
  }

  fun verifyCode(code: String) {
    val verificationId = storedVerificationId
    if (verificationId.isNullOrBlank()) {
      toast("اطلب الكود أولاً")
      return
    }
    if (code.length < 4) {
      toast("اكتب الكود بشكل صحيح")
      return
    }

    Log.d(tag, "verifyCode: codeLength=${code.length}")
    val credential = PhoneAuthProvider.getCredential(verificationId, code)
    signInWithPhoneAuthCredential(credential)
  }

  fun signInWithPhoneAuthCredential(credential: PhoneAuthCredential) {
    Log.d(tag, "signInWithPhoneAuthCredential: starting")

    auth.signInWithCredential(credential)
      .addOnCompleteListener(this) { task ->
        if (task.isSuccessful) {
          val user = task.result.user
          Log.d(tag, "signIn success: uid=${user?.uid}, phone=${user?.phoneNumber}")
          toast("تم تسجيل الدخول بنجاح")
        } else {
          Log.e(tag, "signIn failed: ${task.exception?.message}", task.exception)
          toast("فشل تسجيل الدخول: ${task.exception?.message}")
        }
      }
  }

  private fun toast(msg: String) {
    Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
  }
}

