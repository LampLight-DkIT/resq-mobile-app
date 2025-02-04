import React, { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  FAB,
  IconButton,
} from "react-native-paper";

interface Relation {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
}

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [relations, setRelations] = useState<Relation[]>([
    {
      id: "1",
      name: "Sarah Thompson",
      relationship: "Spouse",
      phoneNumber: "+1 9876543210",
    },
    {
      id: "2",
      name: "Ethan Thompson",
      relationship: "Son",
      phoneNumber: "+1 5554443333",
    },
  ]);

  const handleUpdateRelation = (
    relationId: string,
    field: keyof Relation,
    value: string
  ) => {
    setRelations((prev) =>
      prev.map((r) => (r.id === relationId ? { ...r, [field]: value } : r))
    );
  };

  const handleAddRelation = () => {
    setRelations([
      ...relations,
      {
        id: Date.now().toString(),
        name: "",
        relationship: "",
        phoneNumber: "",
      },
    ]);
  };

  const handleRemoveRelation = (relationId: string) => {
    setRelations(relations.filter((r) => r.id !== relationId));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, padding: 16 }}
    >
      <ScrollView>
        <Text variant="headlineLarge" style={{ marginBottom: 16 }}>
          Family & Relations
        </Text>

        {relations.map((relation) => (
          <Card key={relation.id} style={{ marginBottom: 10 }}>
            <Card.Content>
              <TextInput
                label="Name"
                value={relation.name}
                onChangeText={(value) =>
                  handleUpdateRelation(relation.id, "name", value)
                }
                editable={isEditing}
                mode="outlined"
              />
              <TextInput
                label="Relationship"
                value={relation.relationship}
                onChangeText={(value) =>
                  handleUpdateRelation(relation.id, "relationship", value)
                }
                editable={isEditing}
                mode="outlined"
                style={{ marginTop: 8 }}
              />
              <TextInput
                label="Phone Number"
                value={relation.phoneNumber}
                onChangeText={(value) =>
                  handleUpdateRelation(relation.id, "phoneNumber", value)
                }
                editable={isEditing}
                mode="outlined"
                keyboardType="phone-pad"
                style={{ marginTop: 8 }}
              />
            </Card.Content>
            {isEditing && (
              <Card.Actions>
                <IconButton
                  icon="delete"
                  onPress={() => handleRemoveRelation(relation.id)}
                />
              </Card.Actions>
            )}
          </Card>
        ))}

        <Button
          mode="contained"
          onPress={() => setIsEditing(!isEditing)}
          style={{ marginTop: 16 }}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </ScrollView>

      {isEditing && (
        <FAB
          icon="plus"
          style={{ position: "absolute", right: 20, bottom: 20 }}
          onPress={handleAddRelation}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;
