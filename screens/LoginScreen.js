import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../reducers/user";
import { signInRequest, signUpRequest } from "../lib/request";
import { Button } from "../components/Buttons";
import globalStyle, {
  COLOR_BACK,
  COLOR_CANCEL,
  COLOR_CONFIRM,
  COLOR_PLACEHOLDER,
} from "../globalStyle";
import ModalContent from "../components/ModalContent";
import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "../lib/utils";
import { useErrorModal } from "../components/ErrorModal";
import BackgroundWrapper from "../components/BackgroundWrapper";

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();

  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInEmail, setSignInEmail] = useState("test@test.test");
  const [signInPassword, setSignInPassword] = useState("pass");
  const [setErrorModal, ErrorModal] = useErrorModal();

  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [showTuto1, setShowTuto1] = useState(false);
  const [showTuto2, setShowTuto2] = useState(false);
  const [showTuto3, setShowTuto3] = useState(false);

  const emptyStates = () => {
    setShowSignInModal(false);

    setSignInEmail("");
    setSignInPassword("");
    setShowSignUpModal(false);
    setSignUpUsername("");
    setSignUpEmail("");
    setSignUpPassword("");
  };

  const handleSignIn = async () => {
    if (!signInEmail.match(EMAIL_REGEX)) {
      setErrorModal("Email invalide");
      return;
    }

    if (!signInPassword.match(PASSWORD_REGEX)) {
      setErrorModal("Mot de passe trop court (minimum 4 caractères).");
      return;
    }
    const { result, data } = await signInRequest(signInEmail, signInPassword);
    if (result) {
      console.log("Connection OK : ", data);
      dispatch(login(data));
      navigation.navigate("TabNavigator");
    } else {
      console.log("Connection error : ", data);
      setErrorModal("Email/mot de passe invalide");
    }
  };

  const handleSignUp = () => {
    console.log(!signUpUsername.match(USERNAME_REGEX), signUpUsername);
    if (!signUpUsername.match(USERNAME_REGEX)) {
      setErrorModal(
        "Nom d'utilisateur invalide (maximum 15 caractères, pas de caractères spéciaux)"
      );
      return;
    }

    if (!signUpEmail.match(EMAIL_REGEX)) {
      setErrorModal("Email invalide");
      return;
    }

    if (!signUpPassword.match(PASSWORD_REGEX)) {
      setErrorModal("Mot de passe trop court (minimum 4 caractères).");
      return;
    }

    signUpRequest(signUpUsername, signUpEmail, signUpPassword).then(
      ({ result, data }) => {
        if (result) {
          console.log("Inscription OK : ", data);
          dispatch(login(data));
          setShowSignUpModal(false);
          setShowTuto1(true);
        } else {
          setErrorModal("Erreur d'inscription...");
        }
      }
    );
  };

  const signInModalContent = (
    <ModalContent
      visibleState={showSignInModal}
      containerStyle={globalStyle.modalContainer}
      closeHandler={() => setShowSignInModal(false)}
    >
      <Button
        onPress={emptyStates}
        iconName="cancel"
        color="white"
        size={30}
        containerStyle={styles.closeButton}
      />
      <Text style={globalStyle.screenTitle}>Connexion</Text>
      <KeyboardAvoidingView style={{ width: "100%", alignItems: "center" }}>
        <TextInput
          style={styles.inputs}
          placeholder="Ton adresse mail"
          placeholderTextColor={COLOR_PLACEHOLDER}
          onChangeText={setSignInEmail}
          value={signInEmail}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Ton mot de passe"
          placeholderTextColor={COLOR_PLACEHOLDER}
          secureTextEntry={true}
          onChangeText={setSignInPassword}
          value={signInPassword}
        />
      </KeyboardAvoidingView>
      <Button
        onPress={handleSignIn}
        style={styles.button}
        activeOpacity={0.8}
        text="Se connecter"
        textStyle={styles.buttonText}
        containerStyle={styles.button}
      />
    </ModalContent>
  );

  const signUpModalContent = (
    <ModalContent
      visibleState={showSignUpModal}
      containerStyle={globalStyle.modalContainer}
      closeHandler={() => setShowSignUpModal(false)}
    >
      <Button
        onPress={emptyStates}
        iconName="cancel"
        color="white"
        size={30}
        containerStyle={styles.closeButton}
      />
      <Text style={globalStyle.screenTitle}>Inscription</Text>
      <KeyboardAvoidingView style={{ width: "100%", alignItems: "center" }}>
        <TextInput
          style={styles.inputs}
          placeholder="Ton SkateurTag"
          placeholderTextColor={COLOR_PLACEHOLDER}
          onChangeText={setSignUpUsername}
          value={signUpUsername}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Ton adresse mail"
          placeholderTextColor={COLOR_PLACEHOLDER}
          onChangeText={setSignUpEmail}
          value={signUpEmail}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Ton mot de passe"
          secureTextEntry={true}
          placeholderTextColor={COLOR_PLACEHOLDER}
          onChangeText={setSignUpPassword}
          value={signUpPassword}
        />
      </KeyboardAvoidingView>
      <Button
        onPress={handleSignUp}
        style={styles.button}
        activeOpacity={0.8}
        text="Valider l'inscription"
        containerStyle={styles.button}
      />
    </ModalContent>
  );

  const tuto1 = (
    <ModalContent
      visibleState={showTuto1}
      containerStyle={globalStyle.modalContainer}
    >
      <Text style={globalStyle.screenTitle}>
        Bienvenue sur l'app SkaterQuest ! 🛹
      </Text>
      <Text style={[globalStyle.subSubTitle, { textAlign: "center" }]}>
        Ici, tu pourras suivre ta progression en skate grâce à un livre de
        tricks, trouver des spots et défier tes potes sur un Game of Skate !
      </Text>

      <View>
        <NextButton
          onPress={() => {
            setShowTuto1(false);
            setShowTuto2(true);
          }}
        />
        <SkipButton
          onPress={() => {
            setShowTuto1(false);
            setShowTuto2(false);
            navigation.navigate("TabNavigator");
          }}
        />
      </View>
    </ModalContent>
  );

  const tuto2 = (
    <ModalContent
      visibleState={showTuto2}
      containerStyle={globalStyle.modalContainer}
    >
      <Text style={[globalStyle.screenTitle, { textAlign: "center" }]}>
        Un Game of Skate c'est quoi ?🤔
      </Text>
      <Text style={[globalStyle.subSubTitle, { textAlign: "center" }]}>
        Un skateur fait un trick, l'autre doit le reproduire : à chaque échec,
        il gagne une lettre du mot SKATE jusqu'à être éliminé. 🛹🔥
      </Text>

      <View>
        <NextButton
          onPress={() => {
            setShowTuto2(false);
            setShowTuto3(true);
          }}
        />
        <SkipButton
          onPress={() => {
            setShowTuto1(false);
            setShowTuto2(false);
            setShowTuto3(false);
            navigation.navigate("TabNavigator");
          }}
        />
      </View>
    </ModalContent>
  );

  const tuto3 = (
    <ModalContent
      visibleState={showTuto3}
      containerStyle={globalStyle.modalContainer}
    >
      <Text style={globalStyle.screenTitle}>T'es prêt à rider ? 🛹😎</Text>
      <Text style={globalStyle.subSubTitle}>
        Tu trouveras dans ton livre des tricks les tricks que tu maîtrises et
        ceux que tu vas devoir apprendre pour atteindre le 100% !
      </Text>
      <Text style={globalStyle.screenTitle}>T'es chaud patate ? 🛹💪</Text>
      <View style={styles.tutoButtons}>
        <Button
          onPress={() => {
            setShowTuto1(false);
            setShowTuto2(false);
            setShowTuto3(false);
            navigation.navigate("TabNavigator");
          }}
          containerStyle={styles.button}
          text="C'est parti ! 🤙🛹"
        />
      </View>
    </ModalContent>
  );

  return (
    <BackgroundWrapper flexJustify="space-evenly">
      <Image
        source={require("../assets/LOGO TEMPORAIRE.png")}
        style={styles.logo}
      />
      <Button
        iconName="login"
        text="Connexion"
        size={30}
        onPress={() => {
          setShowSignUpModal(false);
          setShowSignInModal(true);
        }}
        containerStyle={styles.button}
      />

      <Button
        iconName="person-add"
        text={`T'es nouveau ?
Créer un compte ici !`}
        size={30}
        containerStyle={styles.button}
        onPress={() => {
          setShowSignInModal(false);
          setShowSignUpModal(true);
        }}
      />

      {signUpModalContent}
      {signInModalContent}
      {tuto1}
      {tuto2}
      {tuto3}
      <ErrorModal />
    </BackgroundWrapper>
  );
}

const NextButton = ({ onPress }) => (
  <Button
    text="Suivant"
    containerStyle={{ ...styles.button, backgroundColor: COLOR_CONFIRM }}
    onPress={onPress}
  />
);

const SkipButton = ({ onPress }) => (
  <Button
    text="Passer"
    containerStyle={{ ...styles.button, backgroundColor: COLOR_CANCEL }}
    onPress={onPress}
  />
);

const styles = StyleSheet.create({
  button: {
    minWidth: 200,
  },
  signUpContainer: {
    alignItems: "center",
    padding: 5,
    margin: 10,
    marginTop: -300,
    width: "60%",
    height: "70%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 2,
  },
  signInContainer: {
    alignItems: "center",
    padding: 5,
    margin: 10,
    marginTop: -300,
    width: "60%",
    height: "70%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 2,
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "transparent",
  },
  inputs: {
    ...globalStyle.textInput,
  },
  errorMessage: {
    color: "red",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "rgba(114, 111, 111, 0.4)",
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 20,
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(51, 49, 49, 0.7)",
    zIndex: 999,
  },
});
