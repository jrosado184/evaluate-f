import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import getServerIP from "@/app/requests/NetworkAddress";

const PDFPreview = () => {
  const { fileId, filename } = useLocalSearchParams();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const baseUrl = await getServerIP();
      const fullUrl = `${baseUrl}/uploads/${filename}`;
      setFileUrl(fullUrl);
    })();
  }, [filename]);

  const getHtmlContent = (url: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            background: #fff;
          }
          #pdf-container {
            position: relative;
            width: 100vw;
            height: 100vh;
          }
          canvas {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
          }
          input {
            position: absolute;
            padding: 6px;
            font-size: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: white;
            z-index: 1;
          }
          #trainerName {
            top: 105px;
            left: 180px;
            width: 140px;
          }
          #traineeName {
            top: 155px;
            left: 180px;
            width: 140px;
          }
        </style>
      </head>
      <body>
        <div id="pdf-container">
          <canvas id="the-canvas"></canvas>
          <input id="trainerName" placeholder="Trainer Name" />
          <input id="traineeName" placeholder="Trainee Name" />
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
          const loadingTask = pdfjsLib.getDocument("${url}");
          loadingTask.promise.then(pdf => {
            return pdf.getPage(1);
          }).then(page => {
            const scale = 1.4;
            const viewport = page.getViewport({ scale });
            const canvas = document.getElementById('the-canvas');
            const context = canvas.getContext('2d');

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({
              canvasContext: context,
              viewport: viewport
            });
          }).catch(error => {
            const err = document.createElement("pre");
            err.style.color = "red";
            err.style.fontSize = "12px";
            err.innerText = "Failed to load PDF:\\n" + error.message;
            document.body.appendChild(err);
            console.error("PDF.js error", error);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={router.back}>
          <Icon name="chevron-left" size={28} />
        </TouchableOpacity>
        <Text className="text-lg font-inter-semibold">PDF Preview</Text>
        <View style={{ width: 28 }} />
      </View>

      {fileUrl ? (
        <WebView
          originWhitelist={["*"]}
          allowFileAccess
          allowUniversalAccessFromFileURLs
          javaScriptEnabled
          source={{ html: getHtmlContent(fileUrl) }}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1a237e" />
          <Text className="mt-2 text-sm text-gray-500">Loading PDF...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PDFPreview;
