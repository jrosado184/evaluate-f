import SinglePressTouchable from "@/app/utils/SinglePress";
import React, { useRef } from "react";
import { Modal, View, Text } from "react-native";
import SignatureScreen from "react-native-signature-canvas";

interface Props {
  visible: boolean;
  onOK: (signature: string) => void;
  onCancel: () => void;
}

const SignatureModal = ({ visible, onOK, onCancel }: Props) => {
  const ref = useRef<any>(null);

  const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
      margin: 0;
    }
    body,html {
      height: 100%;
    }
  `;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-white">
        <SignatureScreen
          ref={ref}
          onOK={onOK}
          onEmpty={onCancel}
          autoClear={false}
          penColor="#000000" // use solid black ink
          backgroundColor="rgba(0,0,0,0)" // transparent background
          minWidth={2} // minimum stroke width
          maxWidth={4} // maximum stroke width
          dotSize={1} // size of the dot when you tap
          webStyle={webStyle}
          descriptionText="Sign above"
        />

        <View className="flex-row justify-between px-6 py-4 bg-white border-t border-gray-200">
          <SinglePressTouchable
            onPress={() => {
              ref.current?.clearSignature();
              onCancel();
            }}
            className="bg-gray-300 px-6 py-3 rounded-md"
          >
            <Text className="text-gray-800 font-semibold text-base">
              Cancel
            </Text>
          </SinglePressTouchable>
          <SinglePressTouchable
            onPress={() => ref.current?.readSignature()}
            className="bg-emerald-600 px-6 py-3 rounded-md"
          >
            <Text className="text-white font-semibold text-base">Save</Text>
          </SinglePressTouchable>
        </View>
      </View>
    </Modal>
  );
};

export default SignatureModal;
