import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import BackgroundWrapper from "../components/BackgroundWrapper";
import ModalContent from "../components/ModalContent";
import globalStyle, { COLOR_CANCEL, COLOR_PLACEHOLDER } from "../globalStyle";
import { Button } from "../components/Buttons";
import { useSelector } from "react-redux";

// Récupérer la largeur de l'écran
const { width } = Dimensions.get("window");

export default function GosPlayScreen({ navigation }) {
  const { username } = useSelector((state) => state.user.value);
  const [modalVisible, setModalVisible] = useState(true);
  const [skater1, setSkater1] = useState("");
  const [skater2, setSkater2] = useState("");

  // Fonction pour démarrer le jeu
  const startGame = () => {
    !skater1 && setSkater1(username);
    !skater2 && setSkater2("Joueur 2");
    setModalVisible(false);
  };

  // Calcul de la taille du texte
  const getFontSize = () => {
    if (width > 600) {
      // Sur les tablettes, on réduit un peu la taille
      return 70; // Taille plus petite pour les grands écrans
    }
    return 60; // Taille plus grande pour les écrans mobiles
  };

  return (
    <BackgroundWrapper flexJustify="center">
      {/* MODAL DE CONFIGURATION */}
      <ModalContent
        visibleState={modalVisible}
        closeHandler={() => setModalVisible(false)}
        containerStyle={globalStyle.modalContainer}
      >
        <Text style={styles.modalTitle}>Entrez vos pseudos pour cette partie !</Text>

        <TextInput
          placeholder="Joueur 1"
          placeholderTextColor={COLOR_PLACEHOLDER}
          style={globalStyle.textInput}
          onChangeText={setSkater1}
          value={skater1}
          maxLength={8}
        />
        <TextInput
          placeholder="Joueur 2"
          placeholderTextColor={COLOR_PLACEHOLDER}
          style={globalStyle.textInput}
          onChangeText={setSkater2}
          value={skater2}
          maxLength={8}
        />
        <View style={globalStyle.flexRow}>
          <Button
            text="Retour"
            onPress={() => {
              skater1 && skater2
                ? setModalVisible(false)
                : navigation.navigate("Home");
            }}
            containerStyle={{ backgroundColor: COLOR_CANCEL }}
          />
          <Button text="Valider" onPress={startGame} />
        </View>
      </ModalContent>

      {/* TITRE */}
      <Animatable.View
        animation="fadeInDown"
        duration={1200}
        style={styles.gameTitleContainer}
      >
        <Text style={[styles.gameTitle, { fontSize: getFontSize() }]}>
          GAME OF SKATE
        </Text>
      </Animatable.View>

      {/* INFOS SKATERS */}
      <View style={styles.profileContainer}>
        <Animatable.View
          animation="fadeInLeft"
          duration={1000}
          style={styles.profile}
        >
          <Text style={styles.name}>{skater1}</Text>
        </Animatable.View>

        <Animatable.View
          animation="zoomIn"
          duration={800}
          style={styles.versusIconContainer}
        >
          <Text style={styles.versus}>VS</Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeInRight"
          duration={1000}
          style={styles.profile}
        >
          <Text style={styles.name}>{skater2}</Text>
        </Animatable.View>
      </View>

      {/* BOUTONS POUR DÉMARRER LE JEU */}
      <Animatable.View
        animation="zoomIn"
        duration={1200}
        style={styles.buttonContainer}
      >
        {/* Bouton "Tricks aléatoires" */}
        <Button
          iconName="shuffle"
          text="Tricks aléatoires"
          onPress={() =>
            navigation.navigate("GosVersusScreenRandom", {
              skater1,
              skater2,
              gameMode: "Random",
            })
          }
          style={styles.gameButton}
        />

        {/* Bouton "Choix des tricks" */}
        <Button
          iconName="list"
          text="Choix des tricks"
          onPress={() =>
            navigation.navigate("GosVersusScreenChoices", {
              skater1,
              skater2,
              gameMode: "Choix",
            })
          }
          style={styles.gameButton}
        />

        {/* Bouton "Joueurs" */}
        <Button
          iconName="repeat"
          text="Choix pseudos"
          onPress={() => setModalVisible(true)}
          style={styles.reconfigButton}
        />
      </Animatable.View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  gameTitleContainer: {
    marginBottom: 30,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  gameTitle: {
    fontWeight: "bold",
    color: "#FF650C",
    textAlign: "center",
    fontFamily: "sans-serif-condensed",
    textShadowColor: "#FFF",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 3,
    transform: [{ scale: 1.1 }],
  },
  profileContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  profile: {
    flex: 1,
    alignItems: "center",
    maxWidth: 150,
  },
  name: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 25,
    textTransform: "uppercase",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  versusIconContainer: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  versus: {
    fontSize: 36,
    color: "#FF650C",
    fontWeight: "bold",
  },
  buttonContainer: { marginBottom: 50 },
  modalTitle: {
    ...globalStyle.subSubTitle,
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
});
