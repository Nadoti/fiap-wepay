import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/theme/colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.blue[800],
    textAlign: 'center',
    marginRight: 24,
  },
  backButton: {
    padding: 8,
  },
  formContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E4E8',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E4E8',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeButtonActive: {
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: {
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: colors.blue[500],
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  submitText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    borderWidth: 1,
    borderColor: '#E0E4E8',
  },
  categoryChipActive: {
    backgroundColor: colors.blue[100],
    borderColor: colors.blue[500],
  },
  categoryText: {
    color: '#666',
  },
  categoryTextActive: {
    color: colors.blue[800],
    fontWeight: 'bold',
  }
});