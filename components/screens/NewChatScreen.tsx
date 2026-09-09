import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { mockContacts, Contact } from '@/services/mockData';

interface NewChatScreenProps {
  onBack: () => void;
  onSelect: (contact: Contact) => void;
}

export function NewChatScreen({ onBack, onSelect }: NewChatScreenProps) {
  const [search, setSearch] = useState('');
  const filtered = mockContacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textGray} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Select contact</Text>
          <Text style={styles.headerSub}>{filtered.length} contacts</Text>
        </View>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={COLORS.textGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          placeholderTextColor={COLORS.textGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contactItem} onPress={() => onSelect(item as any)}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              {item.online ? <View style={styles.onlineDot} /> : null}
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactStatus}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, backgroundColor: COLORS.bgLight },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textGray },
  backBtn: { padding: 8, marginRight: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgLight, margin: 10, paddingHorizontal: 14, borderRadius: 8, height: 42 },
  searchInput: { flex: 1, marginLeft: 10, color: COLORS.text, fontSize: 15 },
  contactItem: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  avatarWrap: { position: 'relative', marginRight: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.bgLighter, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.bg },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  contactStatus: { fontSize: 14, color: COLORS.textGray, marginTop: 2 },
});
