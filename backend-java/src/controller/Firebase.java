package controller;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import java.io.FileInputStream;
import java.io.IOException;

public class FirebaseConfig {

    public static void initialize() {
        try {
            FileInputStream serviceAccount = new FileInputStream("lib/serviceAccountKey.json");

            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("Firebase initialized successfully!");
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("Failed to initialize Firebase");
        }
    }
}