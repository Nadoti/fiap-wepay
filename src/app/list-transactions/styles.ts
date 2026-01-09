import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/theme/colors";

const { width, height } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 48;
const CELL_WIDTH = CALENDAR_WIDTH / 7;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.blue[800],
  },
  addButton: {
    backgroundColor: colors.blue[500],
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoContainer: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    color: '#999',
  },
  valueContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F2F5',
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E4E8',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: colors.blue[500],
    borderColor: colors.blue[500],
  },
  filterText: {
    fontSize: 13,
    color: '#666',
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  footerLoader: {
    marginTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: height * 0.75,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.blue[800],
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calMonthName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize'
  },
  calNavBtn: {
    padding: 8,
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  weekDayText: {
    width: CELL_WIDTH,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#999',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CELL_WIDTH,
    height: CELL_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: CELL_WIDTH / 2,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  daySelectedStart: {
    backgroundColor: colors.blue[500],
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  daySelectedEnd: {
    backgroundColor: colors.blue[500],
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  daySelectedSingle: {
    backgroundColor: colors.blue[500],
    borderRadius: CELL_WIDTH / 2,
  },
  dayInRange: {
    backgroundColor: colors.blue[100],
    borderRadius: 0,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  dayEmpty: {
    width: CELL_WIDTH,
    height: CELL_WIDTH,
  },
  modalActions: {
    marginTop: 'auto',
    gap: 10,
  },
  applyButton: {
    backgroundColor: colors.blue[500],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#E74C3C',
    fontSize: 14,
  }
});