import React, { useEffect, useState, useRef, useReducer } from "react";
import {
  StyleSheet,
  Text,
  Image,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { useSelector } from "react-redux";
import {
  getSpotInfo,
  unvoteVideo,
  upvoteVideo,
  postVideo,
} from "../lib/request";
import { useBackHandler } from "@react-native-community/hooks";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as ImagePicker from "expo-image-picker";
import VideoPlayer from "../components/VideoPlayer";
import { useIsFocused } from "@react-navigation/native";
import { Button, StateButton } from "../components/Buttons";
import globalStyle, {
  COLOR_CANCEL,
  DEFAULT_THUMBNAIL,
  COLOR_PLACEHOLDER,
} from "../globalStyle";
import ModalContent from "../components/ModalContent";
import { ItemCarrousel } from "../components/ItemCarrousel";
import { formatDate } from "../lib/utils";
import { useErrorModal } from "../components/ErrorModal";

export default function SpotScreen({ navigation, route }) {
  const { token } = useSelector((state) => state.user.value);
  const [videoPlaying, setVideoPlaying] = useState(null);
  const [updateWatcher, forceUpdate] = useReducer((p) => p + 1, 0);
  const [spotData, setSpotData] = useState(route.params.spotData);

  const [setErrorModal, ErrorModal] = useErrorModal();

  // États liés à la publication d'une nouvelle vidéo
  const [selectedVideoUri, setSelectedVideoUri] = useState(null); // Pour stocker l'URI de la vidéo séléctionnée
  const [trickInputs, setTrickInputs] = useState([""]); // Tricks entrés par l'utilisateurs pour les associer à la vidéo
  const [showTrickModal, setShowTrickModal] = useState(false); // État pour afficher/masquer la fenêtre modale permettant de saisir les tricks de la vidéo
  const [uploading, setUploading] = useState(false); // Indicateur de progression du chargement de la vidéo (utile pour envoyer un feedback à l'utilisateur quand la vidéo met du temps à charger)

  // Hook qui détermine si l'écran est actif
  const isFocused = useIsFocused();
  useEffect(() => {
    /*
    isFocused nous dis si l'écran est celui actuellement chargé par l'utilisateur.
    Ici on fetch au montage du composant et au changement d'écran mais seulement
    si on est sur celui ci isFocused = true.
    */
    isFocused &&
      getSpotInfo(token, spotData._id).then(({ result, data }) => {
        data.videos = data.videos.sort(
          (a, b) => b.votes.length - a.votes.length
        );

        result && setSpotData(data);
      });
  }, [isFocused, updateWatcher]);

  // Enregistrement de la vidéo et des tricks associés
  const handleSubmitVideo = async () => {
    // On met le(s) trick(s) saisi(s) (en supprimant les espaces inutiles) dans le tableau trickList
    const trickList = trickInputs.filter((trick) => trick.trim().length > 0);

    // Vérification qu'au moins 1 trick ait été saisi
    if (trickList.length === 0) {
      setErrorModal("Ajoute au moins un trick stp !");
      return;
    } else {
      setShowTrickModal(false);
    }

    // Chargement de la vidéo
    setUploading(true); // Permet d'afficher l'ActivityIndicator dans le JSX pour rendre le chargement visuel
    try {
      const { result } = await postVideo(
        token,
        selectedVideoUri,
        trickList,
        spotData._id
      );
    } finally {
      setUploading(false);
      forceUpdate(); // Disparition de l'ActivityIndicator quand la vidéo est chargée
    }

    if (result) {
      // Mise à jour du spot et des états
      const { data: updatedSpot } = await getSpotInfo(token, spotData._id);
      setSpotData(updatedSpot);
      setShowTrickModal(false);
      setTrickInputs([""]);
      setSelectedVideoUri(null);
    } else {
      setErrorModal("Erreur lors de l'envoi de la vidéo");
    }
  };

  // Fonction pour ajouter un champ de trick
  const handleAddTrick = () => {
    setTrickInputs([...trickInputs, ""]);
  };

  // Fonction pour que la touche retour ferme le lecteur vidéo
  useBackHandler(() => {
    if (videoPlaying) {
      setVideoPlaying(null);
      return true;
    }
    return false;
  });

  // Fonction pour charger une vidéo depuis la galerie du téléphone
  const uploadVideoFromGallery = async () => {
    // Demande de permission d'accès à la galerie (fonction requestMediaLibraryPermissionsAsync() de ImagePicker)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setErrorModal("Permission requise pour accéder à la galerie");
      return; // Interruption de la fonction si l'utilisateur n'autorise pas l'appli à accéder à sa galerie
    }

    // Ouverture de la galerie  (fonction launchImageLibraryAsync() de ImagePicker)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return; // Interruption si l'utilisateur annule

    const videoUri = result.assets[0].uri;
    console.log("Vidéo sélectionnée :", videoUri);
    setSelectedVideoUri(videoUri);
    setShowTrickModal(true); // Ouverture de la fenêtre modale pour saisir les tricks liés à la vidéo
  };

  function VideoCard({ videoData, onPress }) {
    const { token, uID } = useSelector((state) => state.user.value);
    const [thumbnail, setThumbnail] = useState(null);

    // Au montage crée le thumbnail pour la vidéo
    useEffect(() => {
      (async function getThumbnail() {
        VideoThumbnails.getThumbnailAsync(videoData.url).then(setThumbnail);
      })();
    }, []);

    return (
      <Pressable style={styles.videoItem} onPress={onPress}>
        <View>
          <Image
            source={{ uri: thumbnail?.uri ?? DEFAULT_THUMBNAIL }}
            height={180}
            width={360}
            resizeMode="fill"
          />
        </View>
        <View
          style={{
            ...globalStyle.flexRow,
            justifyContent: "space-evenly",
            backgroundColor: COLOR_CANCEL,
            width: 360,
          }}
        >
          <View style={{ ...globalStyle.flexRow, justifyContent: "center" }}>
            <Text>
              {videoData.author.username} - 🕒{" "}
              {formatDate(videoData.creationDate)}
            </Text>
            <StateButton
              value={videoData.votes.some((vote) => vote.uID == uID)}
              iconName="thumb-up"
              activeColor="blue"
              containerStyle={{ backgroundColor: "transparent" }}
              onPress={async (like) => {
                like
                  ? await upvoteVideo(token, videoData._id)
                  : await unvoteVideo(token, videoData._id);
                forceUpdate();
              }}
            />
            <Text style={styles.infoText}> {videoData.votes.length} votes</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // Lecteur vidéo
  if (videoPlaying) {
    return (
      <VideoPlayer
        source={videoPlaying}
        onClose={() => setVideoPlaying(null)}
      />
    );
  }

  return (
    <BackgroundWrapper flexJustify="center">
      <Text style={globalStyle.screenTitle}>{spotData.name}</Text>

      <Text style={{ ...globalStyle.subSubTitle }}>
        Spot de type {spotData.category}
      </Text>

      <ItemCarrousel
        data={spotData.img}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            height={300}
            width={200}
            resizeMode="cover" // Remplit proprement l'espace vertical
          />
        )}
        itemWidth={200}
        itemHeight={300}
        item
      />

      <Button
        onPress={() => navigation.navigate("AddPhotoScreen", { spotData })}
        iconName="add-a-photo"
        text="Ajouter une photo"
      />

      <ItemCarrousel
        data={spotData.videos}
        contentContainerStyle={{ borderWidth: 5, borderColor: "red" }}
        renderItem={({ item }) => {
          return (
            <VideoCard
              key={item._id}
              videoData={item}
              onPress={() => {
                setVideoPlaying(item.url);
              }} // Prop servant à actualier le composant lors d'un changement de vote
            />
          );
        }}
      />

      <Button
        onPress={uploadVideoFromGallery}
        iconName="video-call"
        text="Poster une vidéo"
        size={30}
      />

      <ModalContent
        visibleState={showTrickModal}
        closeHandler={() => setShowTrickModal(false)}
        containerStyle={globalStyle.modalContainer}
      >
        <Text style={{ ...globalStyle.subSubTitle, fontSize: 18 }}>
          Quels tricks sont présents dans la vidéo ?
        </Text>
        {trickInputs.map((trick, index) => (
          <KeyboardAvoidingView
            key={
              index
            } /* Attention à mettre la prop key dans ce composant parent et pas dans TextInput */
          >
            <TextInput
              placeholder={`Trick ${index + 1}`}
              placeholderTextColor={COLOR_PLACEHOLDER}
              value={trick}
              onChangeText={(text) => {
                const updated = [...trickInputs];
                updated[index] = text;
                setTrickInputs(updated);
              }}
              style={globalStyle.textInput}
            />
          </KeyboardAvoidingView>
        ))}

        <Button onPress={handleAddTrick} text="Ajouter un autre trick" />
        <Button onPress={handleSubmitVideo} text="Poster la video" />
      </ModalContent>
      {uploading && (
        <View>
          <Text>Chargement de ta vidéo...</Text>
          <ActivityIndicator size="large" color="orange" />
        </View>
      )}
      <ErrorModal />
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 4,
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    width: "85%",
    fontWeight: "bold",
    marginVertical: 10,
    backgroundColor: "black",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "orange",
  },
  subtitle: {
    fontSize: 12,
    color: "orange",
    marginTop: 6,
  },
  carrouselItem: {
    marginHorizontal: 2,
    borderRadius: 12,
    overflow: "hidden",
    // backgroundColor: "#000",
  },
  photoWrapper: {
    width: "100%",
    aspectRatio: 3 / 4, // portrait
    backgroundColor: "#222", // au cas où l'image charge lentement
  },
  videoItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  buttons: {
    marginBottom: 10,
  },
});
