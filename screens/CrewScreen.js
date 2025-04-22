import React, { useState, useEffect, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import {
  addUserToCrew,
  createCrew,
  getOwnUserInfo,
  leaveCrew,
  promoteToCrewAdmin,
  removeUserFromCrew,
  searchUser,
} from "../lib/request";
import globalStyle, { COLOR_MAIN } from "../globalStyle";
import {
  IconButton,
  IconTextButton,
  StateIconButton,
} from "../components/Buttons";

export default function CrewScreen() {
  const [updateWatcher, forceUpdate] = useReducer((p) => p + 1, 0);
  const isFocused = useIsFocused();
  //Recup les info utilisateur
  const { token } = useSelector((state) => state.user.value);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    getOwnUserInfo(token).then(({ result, data }) => {
      result && setUserData(data);
    });
  }, [isFocused, updateWatcher]);

  const [newCrewName, setNewCrewName] = useState("");
  const [searchResults, setSearchResult] = useState([]);

  async function handleCreateCrew() {
    const { result, reason } = await createCrew(token, newCrewName);
    console.log(result, reason);
    result && forceUpdate();
  }

  async function handleSearchResult(searchText) {
    if (searchText.length < 3) {
      setSearchResult([]);
      return;
    }
    const { data } = await searchUser(token, searchText);
    console.log(data);
    setSearchResult(data.filter((user) => !user.crew));
  }

  async function handleAddMember(userID) {
    const { result } = await addUserToCrew(token, userID);
    result && forceUpdate();
  }

  //Listes des utilisateurs et ajout
  if (userData?.crew) {
    const isUserAdmin = userData.crew.admins.includes(userData.uID);
    return (
      <BackgroundWrapper>
        <Text style={globalStyle.screenTitle}>{userData.crew.name}</Text>
        <FlatList
          data={userData.crew.members}
          renderItem={({ item }) => {
            return (
              <MemberCard
                memberData={item}
                isAdmin={userData.crew.admins.includes(item.uID)}
                isUser={userData.uID == item.uID}
                isUserAdmin={isUserAdmin}
                forceUpdate={forceUpdate}
              />
            );
          }}
          contentContainerStyle={styles.memberContainer}
        />
        <TextInput
          style={globalStyle.textInput}
          placeholderTextColor="white"
          placeholder="Nouveau membre"
          onChangeText={handleSearchResult}
        />
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <Image
                source={
                  item.avatar
                    ? { uri: item.avatar }
                    : require("../assets/Trasher.png")
                }
                height={50}
                width={50}
                style={styles.userAvatar}
              />
              <Text>{item.username}</Text>
              <IconButton
                iconName="group-add"
                onPress={() => handleAddMember(item.uID)}
              />
            </View>
          )}
        />
      </BackgroundWrapper>
    );
  }
  //Creation d'un crew
  return (
    <BackgroundWrapper>
      <Text style={globalStyle.screenTitle}>
        Tu n'as pas de crew, fais toi inviter ou crée en un !
      </Text>
      <TextInput
        style={globalStyle.textInput}
        placeholderTextColor="white"
        onChangeText={setNewCrewName}
        placeholder=" Nom de Ton crew"
      ></TextInput>
      <IconTextButton
        iconName="send"
        text="Go"
        textStyle={{
          ...globalStyle.screenTitle,
          fontSize: 32,
          padding: 0,
          lineHeight: 32,
        }}
        containerStyle={styles.createButton}
        color={COLOR_MAIN}
        size={48}
        onPress={handleCreateCrew}
      />
    </BackgroundWrapper>
  );
}

function MemberCard({ memberData, isAdmin, isUser, isUserAdmin, forceUpdate }) {
  const { token } = useSelector((state) => state.user.value);

  async function handleLeaveCrew() {
    const { result } = await leaveCrew(token);
    console.log(result);
    result && forceUpdate();
  }

  async function handleAdmin(isAdmin) {
    const { result } = isAdmin
      ? await promoteToCrewAdmin(token, memberData.uID)
      : await demoteFromCrewAdmin(token, memberData.uID);
  }

  async function handleRemoveMember() {
    const { result } = await removeUserFromCrew(token, memberData.uID);
    console.log(result);
    result && forceUpdate();
  }

  return (
    <View style={styles.memberCard}>
      <Image
        source={
          memberData.avatar
            ? { uri: memberData.avatar }
            : require("../assets/Trasher.png")
        }
        height={50}
        width={50}
        style={styles.userAvatar}
      />
      <Text style={globalStyle.subTitle}>{memberData.username}</Text>
      <View style={styles.controlContainer}>
        {isUserAdmin && !isUser && (
          <>
            <StateIconButton
              iconName="admin-panel-settings"
              value={isAdmin}
              onPress={handleAdmin}
            />
            <IconButton iconName="cancel" onPress={handleRemoveMember} />
          </>
        )}
        {isUser && (
          <IconButton iconName="door-back" onPress={handleLeaveCrew} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...globalStyle.screenTitle,
  },
  memberContainer: {
    width: "80%",
  },
  memberCard: {
    ...globalStyle.flexRow,
    width : "100%",
    justifyContent: "space-between",
  },
  userAvatar: {
    height: 100,
    width: 100,
  },
  controlContainer: {
    width: "20%",
    justifyContent: "space-evenly",
    ...globalStyle.flexRow,
  },
  createButton: {
    padding: 12,
    backgroundColor: "black",
  },
});
