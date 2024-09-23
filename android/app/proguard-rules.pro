# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# For react-native-fs
-keep class com.rnfs.** { *; }

# For react-native-share
-keep class cl.json.** { *; }
-keep class com.facebook.react.modules.share.** { *; }

# For XLSX (Excel sheet generation)
-keep class org.apache.poi.** { *; }
-keep class com.github.mjdev.** { *; }
-keep class org.apache.xmlbeans.** { *; }

# For Firebase Firestore
-keep class com.google.firebase.firestore.** { *; }
-keep class com.google.android.gms.tasks.** { *; }
