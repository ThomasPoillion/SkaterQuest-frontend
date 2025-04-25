import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { useIsFocused } from "@react-navigation/native";
import { addPictureToSpot } from "../lib/request";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView, Camera } from "expo-camera";
import globalStyle from "../globalStyle";
import { Button } from "../components/Buttons";

// Calcul dynamique de la hauteur de la caméra selon le ratio
// const cameraWidth = Dimensions.get("window").width - 40;
// const cameraHeight = cameraWidth * (3/4);

export default function AddPhotoScreen({ navigation, route }) {
  const isFocused = useIsFocused(); // La méthode useIsFocused() permet de ne pas afficher la caméra si l'écran n'est pas focus
  const [hasPermission, setHasPermission] = useState(false);
  const cameraRef = useRef(null); // Référence du composant CameraView afin de pouvoir prendre une photo
  //const [cameraRatio, setCameraRatio] = useState("4:3"); // Cet état servira à définir un ratio (4:3) pour les dimensions des photos (utile pour contrôler l'affichage des photos dans SpotScreen)
  //const [cameraReady, setCameraReady] = useState(false); // État pour contrôler si la caméra est prête

  const [photosSpot, setPhotosSpot] = useState([]); // État pour enregistrer les photos du spot prises par l'utilisateur
  const [uploading, setUploading] = useState(false); // Indicateur de progression pour l'envoi des photos (utile pour envoyer un feedback à l'utilisateur ça met du temps à charger)

  const { token } = useSelector((state) => state.user.value);
  const { spotData } = route.params;

  // Hook d'effet pour vérifier la permission de la caméra
  useEffect(() => {
    (async () => {
      const result = await Camera.requestCameraPermissionsAsync();
      setHasPermission(result && result?.status === "granted");
    })();
  }, []);

  // Vérification de si le ratio 4:3 est supporté (certains appareil ne le supportent pas, ce qui ferait crash l'appli sans cette sécurité)
  // On le fait dans une fonction qui sera appelé quand la caméra sera prête (grâce à la prop onCameraReady de CameraView)
  // const ratioVerification = async () => {
  //   // On s'assure que la caméra soit prête
  //   if (cameraRef.current) {
  //     try {
  //       const ratios = await cameraRef.current.getSupportedRatiosAsync(); // Cette variable va ainsi contenir tous les ratios supportés par l'appareil photo du téléphone
  //       console.log("Supported ratios :", ratios);

  //       if (!ratios.includes("4:3") && ratios.length > 0) {
  //         // Si cette liste des ratios supportés ne contient pas le format 4:3 ET contient au moins 1 (autre) ratio alors on change l'état cameraRatio
  //         setCameraRatio(ratios[0]); // ratios[0] correspond ainsi au 1er élément de ratios, c'est à dire le 1er ratio valide pour le téléphone
  //         console.log("Using ratio :", ratios[0]);
  //       } else {
  //         setCameraRatio("4:3"); // Par sécurité (même si à priori redondant avec l'initialisation de l'état)
  //         console.log("Ratio 4:3 supported by the device");
  //       }
  //     } catch (error) {
  //       console.error("Error getting supported ratios :", error);
  //     }
  //   }
  // };

  // Fonction pour prendre une photo
  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.3 });
    console.log("New taken photo :", photo);
    photo && setPhotosSpot([...photosSpot, photo]); // Ajout de la photo dans l'état photoSpot
  };

  // Fonction pour sauver en BDD les photos prises
  const savePhotos = async () => {
    console.log("Number of photos :", photosSpot.length);
    if (photosSpot.length > 0) {
      setUploading(true); // Affichage de l'indicateur de chargement
      for (const takenPhoto of photosSpot) {
        const { result, error } = await addPictureToSpot(
          token,
          takenPhoto.uri,
          spotData._id
        );
        console.log("photo URI :", takenPhoto.uri);
        console.log("result :", result, ", error :", error);
      }
      setUploading(false); // Masquage de l'indicateur de chargement
    }
    photosSpot.length > 0 && navigation.goBack();
    // NB : Avec un débit internet faible ça peut prendre plusieurs secondes ou minutes pour revenir sur SpotScreen, ajouter un ActivityIndicator
  };

  return (
    <BackgroundWrapper flexJustify={"center"}>
      <Text style={globalStyle.screenTitle}>Prends des photos du spot !</Text>

      {!hasPermission || !isFocused ? (
        <View>
          <Text>
            Pour prendre une photo de ce spot, tu dois autoriser l'appli à
            accéder à ton appareil !
          </Text>
        </View>
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          //ratio={cameraRatio} // Donne le ratio préparé plus tôt
          // onCameraReady={ratioVerification} // Événement onCameraReady pour savoir quand la caméra est prête
        />
      )}

      <TouchableOpacity
        onPress={() => {
          takePicture();
        }}
        style={styles.button}
        activeOpacity={0.8}
      >
        <MaterialIcons
          style={styles.photoButton}
          name="motion-photos-on" // Autre possibilité : "camera-alt"
          size={48}
          color="white"
        />
      </TouchableOpacity>

      <ScrollView
        horizontal // Car vertical par défaut
        style={styles.previewScroll}
        contentContainerStyle={styles.previewContainer}
        showsHorizontalScrollIndicator={false} // Pour masquer la barre de scroll
      >
        {photosSpot.map((photo, index) => (
          // Fonctionnalité pour supprimer une photo en la touchant longtemps
          <TouchableOpacity
            key={index}
            onLongPress={() => {
              Alert.alert(
                "Supprimer cette photo ?",
                "Cette action est irréversible.",
                [
                  { text: "Annuler", style: "cancel" },
                  {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: () => {
                      setPhotosSpot((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    },
                  },
                ]
              );
            }}
          >
            <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {photosSpot.length > 0 && (
        <>
          <Text style={styles.deleteHint}>
            Fais un appui long sur une photo pour la supprimer
          </Text>

          {uploading && (
            <View>
              <Text>Chargement des photos...</Text>
              <ActivityIndicator size="large" color="orange" />
            </View>
          )}

          <Button onPress={savePhotos} text="Valider ces photos" />
        </>
      )}
    </BackgroundWrapper>
  );
}

const { width, height } = Dimensions.get("window"); // Pour un affichage responsive de la caméra

const styles = StyleSheet.create({
  title: {
    color: "orange",
    fontSize: 24,
    padding: 10,
  },
  cameraContainer: {
    alignItems: "center",
  },
  camera: {
    flex: 1, // Pour que la caméra occupe tout l'espace disponible
    width: width - 40,
    height: (width - 40) * (3 / 4), // Ratio 4:3 vertical (portrait)
    borderRadius: 10,
    overflow: "hidden",
    // height: (width - 40) * (3 / 4), // Pour que la caméra ait le même format 4:3 que les photos
    // height: cameraHeight, // Appliquer la hauteur calculée
  },
  photoButton: {
    padding: 8,
    // marginBottom: 10,
  },
  previewScroll: {
    marginTop: 16,
    marginBottom: 16,
    maxHeight: 90,
  },
  previewContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  deleteHint: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: 600,
    color: "black",
    marginBottom: 10,
  },
});
