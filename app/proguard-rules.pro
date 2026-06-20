# Add project-specific ProGuard rules here.
# By default, the transition and layout optimizations are already included in default proguard rules.

# Maintain model classes for serialization (JSON, etc.)
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep Compose-specific components safe
-keepclassmembers class * extends androidx.lifecycle.ViewModel {
    <init>(...);
}

# Suppress warnings from platform libraries that don't affect runtime
-dontwarn javax.annotation.**
-dontwarn java.lang.instrument.**
-dontwarn sun.misc.**
-dontwarn org.codehaus.mojo.animal_sniffer.**

# Keep our models and data classes intact if needed
-keep class com.kamus.shorofdigitalpro.DictionaryData { *; }
-keep class com.kamus.shorofdigitalpro.DictionaryEntry { *; }
-keep class com.kamus.shorofdigitalpro.TasrifIstilahi { *; }
-keep class com.kamus.shorofdigitalpro.DataWazan { *; }
-keep class com.kamus.shorofdigitalpro.LughowiTasrif { *; }
