import React, { useState, useEffect, useReducer } from "react";
import { useSelector } from "react-redux";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import BackgroundWrapper from "../components/BackgroundWrapper";
import * as ImagePicker from "expo-image-picker";
import { Button, StateButton } from "../components/Buttons";
import globalStyle, {
  COLOR_CANCEL,
  DEFAULT_AVATAR,
  COLOR_PLACEHOLDER,
} from "../globalStyle";
import {
  changeUserAvatar,
  getOwnUserInfo,
  updateSkaterTag,
} from "../lib/request";
import { useIsFocused } from "@react-navigation/native";
import ModalContent from "../components/ModalContent";
import { useConfirmationModal } from "../components/ConfirmModal";
import { useErrorModal } from "../components/ErrorModal";
import { USERNAME_REGEX } from "../lib/utils";

export default function SettingsScreen({ navigation }) {
  const [updateWatcher, forceUpdate] = useReducer((p) => p + 1, 0);
  const isFocused = useIsFocused();
  const { token } = useSelector((state) => state.user.value);
  const [userData, setUserData] = useState(null);
  const [uploading, setUploading] = useState(false); // Pour activer l'indicateur visuel du chargement de l'avatar lors d'un changement

  const [setConfim, ConfirmModal] = useConfirmationModal();
  const [setErrorModal, ErrorModal] = useErrorModal();

  useEffect(() => {
    getOwnUserInfo(token).then(({ result, data }) => {
      if (result) {
        console.log("USER DATA REÇUE :", data); // 👈 Log ici
        setUserData(data);
      }
    });
  }, [updateWatcher, isFocused]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newSkaterTag, setNewSkaterTag] = useState("");

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setErrorModal("Permission requise, autorise l'accès à la galerie");
      return false;
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
        const uri = pickerResult.assets[0].uri;
        setUploading(true); // Affichage de l'indicateur de chargement
        const { result } = await changeUserAvatar(token, uri);
        setUploading(false); // Masquage de l'indicateur de chargement
        // Affichage d'un écran de confirmation pour l'utilisateur (car l'éditeur de launchImageLibraryAsync n'est pas très clair à ce niveau)
        if (result) {
          setErrorModal("Succès", "Ton avatar a été mis à jour !");
          forceUpdate();
        } else {
          setErrorModal("Erreur", "Impossible de mettre à jour l'avatar :(");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
    }
  };

  const handleImagePress = () => {
    setConfim({
      text: "Changer ta photo de profil ?",
      handle: pickImageFromLibrary,
    });
  };

  const handleUpdateSkaterTag = async () => {
    if (!newSkaterTag.trim().match(USERNAME_REGEX)) {
      setErrorModal(
        "Le SkaterTag doit contenir maximum 15 lettres (sans caractères spéciaux)."
      );
      return;
    }
    const { result } = await updateSkaterTag(token, newSkaterTag.trim());
    if (result.result) {
      setModalVisible(false);
      setErrorModal("Succès", "Ton SkaterTag a été mis à jour !");
      forceUpdate();
    } else {
      setErrorModal("Échec de la mise à jour");
    }
  };

  return (
    <BackgroundWrapper flexJustify="center">
      <TouchableOpacity onPress={handleImagePress} activeOpacity={0.6}>
        {uploading ? (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={globalStyle.avatar}
          />
        ) : (
          <Image
            source={{ uri: userData?.avatar ?? DEFAULT_AVATAR }}
            width={200}
            height={200}
            style={[globalStyle.avatar, { marginTop: 60 }]}
          />
        )}
      </TouchableOpacity>

      <Text style={globalStyle.skaterTag}>
        {userData?.skaterTag ?? "@" + userData?.username ?? ""}
      </Text>

      <Text style={globalStyle.screenTitle}>Reglages</Text>

      <View style={styles.buttonContainer}>
        <Button
          iconName="edit"
          text="Changer SkaterTag"
          iconLeft
          onPress={() => setModalVisible(true)}
        />
        <StateButton
          iconName="dark-mode"
          activeIconName="light-mode"
          text="Mode sombre"
          activeText="Mode clair"
          //   onPress={() => console.log("Autres options")}
        />
        {/* <Button
          iconName="settings"
          text="Option 2"
          onPress={() => console.log("Autres options")}
        />
        <Button
          iconName="settings"
          text="Option 3"
          onPress={() => console.log("Autres options")}
        /> */}
      </View>

      {/* Modal de changement de SkaterTag */}
      <ModalContent
        visibleState={modalVisible}
        closeHandler={() => setModalVisible(false)}
        containerStyle={globalStyle.modalContainer}
      >
        <Text style={styles.modalTitle}>Nouveau SkaterTag</Text>
        <TextInput
          style={globalStyle.textInput}
          placeholder="Entre ton nouveau pseudo"
          placeholderTextColor={COLOR_PLACEHOLDER}
          value={newSkaterTag}
          onChangeText={setNewSkaterTag}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Button
            text="Annuler"
            containerStyle={{ backgroundColor: COLOR_CANCEL }}
            onPress={() => setModalVisible(false)}
          />
          <Button text="Valider" onPress={handleUpdateSkaterTag} />
        </View>
      </ModalContent>

      <ErrorModal />
      <ConfirmModal />
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: "space-evenly",
  },
  modalTitle: {
    ...globalStyle.subSubTitle,
    fontSize: 18,
  },
});
