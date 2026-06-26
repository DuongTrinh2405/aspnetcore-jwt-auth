import {
  getGoogleMapsSearchUrl,
  JOB_PRIORITY_LABELS,
  JOB_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPES,
  validateCreateJobInput,
  type CurrentUserProfile,
  type Job,
  type JobPriority,
  type ServiceType
} from "@cnl/shared";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { createCustomerJob, fetchCustomerJobs } from "../services/jobs";

type CustomerHomeScreenProps = {
  profile: CurrentUserProfile;
  onSignOut: () => void;
};

type TabKey = "home" | "create" | "jobs" | "profile";

export function CustomerHomeScreen({ profile, onSignOut }: CustomerHomeScreenProps) {
  const [tab, setTab] = useState<TabKey>("home");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadJobs() {
    setLoading(true);
    try {
      setJobs(await fetchCustomerJobs());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>CNL Service</Text>
          <Text style={styles.title}>Xin chào, {profile.fullName || "khách hàng"}</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>C</Text></View>
      </View>

      {tab === "home" ? <CustomerDashboard jobs={jobs} loading={loading} setTab={setTab} /> : null}
      {tab === "create" ? <CreateJobView afterCreate={async () => { await loadJobs(); setTab("jobs"); }} /> : null}
      {tab === "jobs" ? <JobHistoryView jobs={jobs} loading={loading} refresh={loadJobs} /> : null}
      {tab === "profile" ? <ProfileView profile={profile} onSignOut={onSignOut} /> : null}

      <View style={styles.tabBar}>
        {[
          ["home", "Tổng quan"],
          ["create", "Tạo job"],
          ["jobs", "Lịch sử"],
          ["profile", "Hồ sơ"]
        ].map(([key, label]) => (
          <Pressable key={key} style={[styles.tabItem, tab === key && styles.tabItemActive]} onPress={() => setTab(key as TabKey)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function CustomerDashboard({ jobs, loading, setTab }: { jobs: Job[]; loading: boolean; setTab: (tab: TabKey) => void }) {
  const stats = useMemo(() => ({
    total: jobs.length,
    pending: jobs.filter((job) => job.status === "pending").length,
    active: jobs.filter((job) => job.status === "accepted" || job.status === "in_progress").length
  }), [jobs]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroBadge}>Premium dispatch</Text>
        <Text style={styles.heroTitle}>Tạo yêu cầu sửa chữa trong vài phút.</Text>
        <Text style={styles.heroText}>Camera, Wi-Fi, internet và điện nhẹ. Theo dõi trạng thái ngay trong app.</Text>
        <Pressable style={styles.primaryButton} onPress={() => setTab("create")}>
          <Text style={styles.primaryButtonText}>Tạo job mới</Text>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <MetricCard label="Tổng job" value={loading ? "..." : String(stats.total)} />
        <MetricCard label="Đang chờ" value={loading ? "..." : String(stats.pending)} />
        <MetricCard label="Đang xử lý" value={loading ? "..." : String(stats.active)} />
      </View>

      <Text style={styles.sectionTitle}>Job gần đây</Text>
      {jobs.slice(0, 3).map((job) => <MobileJobCard key={job.id} job={job} />)}
      {!loading && jobs.length === 0 ? <EmptyState text="Chưa có job nào. Hãy tạo yêu cầu đầu tiên." /> : null}
    </ScrollView>
  );
}

function CreateJobView({ afterCreate }: { afterCreate: () => void }) {
  const [serviceType, setServiceType] = useState<ServiceType>("camera_install");
  const [priority, setPriority] = useState<JobPriority>("normal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMessage("");
    const trimmedAddress = address.trim();
    const resolvedGoogleMapsUrl = googleMapsUrl.trim() || (trimmedAddress.length >= 5 ? getGoogleMapsSearchUrl(trimmedAddress) : "");
    const result = validateCreateJobInput({ service_type: serviceType, priority, title, description, address, google_maps_url: resolvedGoogleMapsUrl, phone });
    if (!result.ok) {
      setMessage(Object.values(result.errors)[0] ?? "Kiểm tra lại thông tin.");
      return;
    }

    setLoading(true);
    try {
      await createCustomerJob(result.data);
      setTitle("");
      setDescription("");
      setAddress("");
      setGoogleMapsUrl("");
      setPhone("");
      afterCreate();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tạo được job.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Tạo yêu cầu kỹ thuật</Text>
      <View style={styles.formCard}>
        <Text style={styles.label}>Loại dịch vụ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {SERVICE_TYPES.map((item) => (
            <Pressable key={item} style={[styles.chip, serviceType === item && styles.chipActive]} onPress={() => setServiceType(item)}>
              <Text style={[styles.chipText, serviceType === item && styles.chipTextActive]}>{SERVICE_TYPE_LABELS[item]}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Field label="Tiêu đề" value={title} onChangeText={setTitle} placeholder="Lắp 2 camera trước nhà" />
        <Field label="Số điện thoại" value={phone} onChangeText={setPhone} placeholder="090..." keyboardType="phone-pad" />
        <Field label="Địa chỉ" value={address} onChangeText={setAddress} placeholder="Số nhà, đường, quận/huyện" />
        <View style={styles.mapBox}>
          <Text style={styles.mapTitle}>Ghim Google Maps tự động</Text>
          <Text style={styles.mapText}>Nhập địa chỉ là app tự lưu link Google Maps cho kỹ thuật viên. Muốn kiểm tra vị trí thì mở bản đồ bên dưới.</Text>
          <Pressable style={styles.mapButton} onPress={() => Linking.openURL(getGoogleMapsSearchUrl(address.trim() || "vị trí của tôi"))}>
            <Text style={styles.mapButtonText}>Mở Google Maps</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            value={googleMapsUrl}
            onChangeText={setGoogleMapsUrl}
            placeholder="Link Maps chính xác hơn nếu có"
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.label}>Mô tả</Text>
        <TextInput style={[styles.input, styles.textArea]} multiline value={description} onChangeText={setDescription} placeholder="Mô tả tình trạng hoặc nhu cầu..." />

        <Text style={styles.label}>Ưu tiên</Text>
        <View style={styles.priorityGrid}>
          {(["low", "normal", "high", "urgent"] as JobPriority[]).map((item) => (
            <Pressable key={item} style={[styles.priorityChip, priority === item && styles.chipActive]} onPress={() => setPriority(item)}>
              <Text style={[styles.chipText, priority === item && styles.chipTextActive]}>{JOB_PRIORITY_LABELS[item]}</Text>
            </Pressable>
          ))}
        </View>

        {message ? <Text style={styles.errorText}>{message}</Text> : null}
        <Pressable style={styles.primaryButton} disabled={loading} onPress={submit}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Gửi yêu cầu</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function JobHistoryView({ jobs, loading, refresh }: { jobs: Job[]; loading: boolean; refresh: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Lịch sử job</Text>
        <Pressable style={styles.smallButton} onPress={refresh}><Text style={styles.smallButtonText}>Làm mới</Text></Pressable>
      </View>
      {loading ? <ActivityIndicator color="#0F4C81" /> : jobs.map((job) => <MobileJobCard key={job.id} job={job} />)}
      {!loading && jobs.length === 0 ? <EmptyState text="Chưa có job nào." /> : null}
    </ScrollView>
  );
}

function ProfileView({ profile, onSignOut }: CustomerHomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Hồ sơ</Text>
        <Text style={styles.profileName}>{profile.fullName}</Text>
        <Text style={styles.muted}>{profile.email}</Text>
        <Text style={styles.muted}>{profile.role === "customer_vip" ? "Khách VIP" : "Khách thường"}</Text>
        <Pressable style={styles.outlineButton} onPress={onSignOut}><Text style={styles.outlineText}>Đăng xuất</Text></Pressable>
      </View>
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; placeholder: string; keyboardType?: "default" | "phone-pad"; onChangeText: (value: string) => void }) {
  return (
    <View>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput style={styles.input} value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder} keyboardType={props.keyboardType ?? "default"} />
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function MobileJobCard({ job }: { job: Job }) {
  return (
    <View style={styles.jobCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.serviceLabel}>{SERVICE_TYPE_LABELS[job.service_type]}</Text>
        <Text style={styles.statusPill}>{JOB_STATUS_LABELS[job.status]}</Text>
      </View>
      <Text style={styles.jobTitle}>{job.title}</Text>
      <Text style={styles.jobText}>{job.address}</Text>
      <Text style={styles.jobText}>{job.phone}</Text>
      <Text style={styles.priorityText}>{JOB_PRIORITY_LABELS[job.priority]} {job.is_vip ? "• VIP" : ""}</Text>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  kicker: { color: "#2563EB", fontWeight: "700", letterSpacing: 0.4 },
  title: { marginTop: 4, fontSize: 24, lineHeight: 31, fontWeight: "700", color: "#0F172A" },
  avatar: { width: 46, height: 46, borderRadius: 18, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  content: { padding: 22, paddingBottom: 110 },
  heroCard: { borderRadius: 28, backgroundColor: "#2563EB", padding: 24, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.2, shadowRadius: 28, elevation: 8 },
  heroBadge: { color: "#CFFAFE", fontWeight: "700", textTransform: "uppercase", fontSize: 12 },
  heroTitle: { marginTop: 14, color: "#fff", fontSize: 29, lineHeight: 36, fontWeight: "700" },
  heroText: { marginTop: 10, color: "#DBEAFE", lineHeight: 22, fontSize: 15 },
  primaryButton: { marginTop: 18, minHeight: 54, borderRadius: 18, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  statsGrid: { marginTop: 18, flexDirection: "row", gap: 10 },
  metricCard: { flex: 1, borderRadius: 22, backgroundColor: "#fff", padding: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  metricLabel: { color: "#64748B", fontWeight: "600", fontSize: 12 },
  metricValue: { marginTop: 8, color: "#0F172A", fontWeight: "700", fontSize: 25 },
  sectionTitle: { fontSize: 25, lineHeight: 31, fontWeight: "700", color: "#0F172A" },
  formCard: { marginTop: 16, borderRadius: 28, backgroundColor: "#fff", padding: 18, borderWidth: 1, borderColor: "#E2E8F0" },
  label: { marginTop: 14, marginBottom: 8, color: "#334155", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: "#0F172A" },
  textArea: { minHeight: 110, textAlignVertical: "top" },
  mapBox: { marginTop: 14, borderRadius: 20, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", padding: 14, gap: 10 },
  mapTitle: { color: "#0F172A", fontWeight: "700", fontSize: 15 },
  mapText: { color: "#64748B", lineHeight: 20, fontWeight: "500" },
  mapButton: { minHeight: 50, borderRadius: 18, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  mapButtonText: { color: "#fff", fontWeight: "700" },
  chipRow: { marginVertical: 4 },
  chip: { marginRight: 10, borderRadius: 999, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 10 },
  chipActive: { backgroundColor: "#0F4C81", borderColor: "#0F4C81" },
  chipText: { color: "#64748B", fontWeight: "700" },
  chipTextActive: { color: "#fff" },
  priorityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  priorityChip: { borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 13, paddingVertical: 10 },
  errorText: { marginTop: 14, color: "#EF4444", fontWeight: "800" },
  jobCard: { marginTop: 12, borderRadius: 22, backgroundColor: "#fff", padding: 17, borderWidth: 1, borderColor: "#E2E8F0" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  serviceLabel: { color: "#0F4C81", fontWeight: "900", fontSize: 12, textTransform: "uppercase" },
  statusPill: { overflow: "hidden", borderRadius: 999, backgroundColor: "#ECFEFF", color: "#0E7490", paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: "900" },
  jobTitle: { marginTop: 12, color: "#0F172A", fontWeight: "700", fontSize: 18 },
  jobText: { marginTop: 6, color: "#64748B", lineHeight: 20 },
  priorityText: { marginTop: 10, color: "#0F172A", fontWeight: "800" },
  emptyState: { marginTop: 16, borderRadius: 22, backgroundColor: "#fff", padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  emptyText: { color: "#64748B", fontWeight: "700", textAlign: "center" },
  smallButton: { borderRadius: 999, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "#fff" },
  smallButtonText: { color: "#0F4C81", fontWeight: "900" },
  profileName: { marginTop: 12, fontSize: 24, fontWeight: "900", color: "#0F172A" },
  muted: { marginTop: 7, color: "#64748B", fontWeight: "700" },
  outlineButton: { marginTop: 20, borderRadius: 16, borderWidth: 1, borderColor: "#0F4C81", paddingVertical: 14, alignItems: "center" },
  outlineText: { color: "#0F4C81", fontWeight: "900" },
  tabBar: { position: "absolute", left: 16, right: 16, bottom: 14, flexDirection: "row", borderRadius: 24, backgroundColor: "#fff", padding: 7, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.14, shadowRadius: 26, elevation: 8 },
  tabItem: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  tabItemActive: { backgroundColor: "#0F4C81" },
  tabText: { color: "#64748B", fontSize: 12, fontWeight: "900" },
  tabTextActive: { color: "#fff" }
});
