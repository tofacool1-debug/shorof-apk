import 'package:flutter/material.dart';

void main() {
  runApp(AlqomuspremiumApp());
}

class AlqomuspremiumApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Al qomus premium',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.emerald),
        useMaterial3: true,
      ),
      home: Scaffold(
        appBar: AppBar(title: Text('Al qomus premium - Kotak Premium')),
        body: Center(
          child: Container(
            width: 300,
            height: 150,
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.emerald.withOpacity(0.3),
                  blurRadius: 16,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.book, size: 40, color: Colors.emerald),
                SizedBox(height: 10),
                Text('Kotak Ngambang Berhasil! ✨',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
