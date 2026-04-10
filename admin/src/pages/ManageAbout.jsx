import React, { useEffect, useState, useMemo, useRef } from 'react';
import HierarchyForm from '../components/HierarchyForm';
import {
  getAboutUs,
  createOrUpdateAboutUs,
  getGovernance,
  createOrUpdateGovernance,
  getMessages,
  createOrUpdateMessage,
  deleteMessage,
  uploadAboutImage,
  createGeographicActivity,
  updateGeographicActivity,
  deleteGeographicActivity,
  getGeographicActivities,
} from '../utils/api';

const DEFAULT_ABOUT_US_FORM = {
  title: '',
  content: '',
  image: '',
  mission: '',
  vision: ''
};

const createDefaultGovernanceHierarchy = () => ([
  {
    id: 'chairperson-root',
    name: '',
    position: 'Chairperson',
    experience: '',
    image: '',
    children: []
  }
]);

const DEFAULT_GOVERNANCE_POLICY_TIERS = [
  { code: 'A.)', title: 'Governing Board', content: '' },
  { code: 'B.)', title: 'Advisory Council', content: '' },
  { code: 'C.)', title: 'Executive Board', content: '' },
  { code: 'D.)', title: 'Departments & Divisions', content: '' }
];

const createDefaultGovernancePolicyTiers = () =>
  DEFAULT_GOVERNANCE_POLICY_TIERS.map((tier) => ({ ...tier }));

const normalizeGovernancePolicyTiers = (tiers) => {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return createDefaultGovernancePolicyTiers();
  }

  return tiers.map((tier, index) => {
    const fallback = DEFAULT_GOVERNANCE_POLICY_TIERS[index] || { code: '', title: '', content: '' };
    return {
      code: String(tier?.code ?? fallback.code).trim(),
      title: String(tier?.title ?? fallback.title).trim(),
      content: String(tier?.content ?? '').trim()
    };
  });
};

// Indian States and Districts data
const indianStatesAndDistricts = {
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari'],
  'Arunachal Pradesh': ['Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Kra Daadi', 'Kurung Kumey', 'Lepa Rada', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Subansiri', 'Namsai', 'Papum Pare', 'Siang', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'],
  'Assam': ['Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri'],
  'Bihar': ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'],
  'Chhattisgarh': ['Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja'],
  'Goa': ['North Goa', 'South Goa'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
  'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
  'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
  'Jharkhand': ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'],
  'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
  'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
  'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
  'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'],
  'Meghalaya': ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
  'Mizoram': ['Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Saitual', 'Serchhip'],
  'Nagaland': ['Chümoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyü', 'Tuensang', 'Wokha', 'Zunheboto'],
  'Odisha': ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'],
  'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr', 'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar', 'Sangrur', 'Sri Muktsar Sahib', 'Tarn Taran'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
  'Sikkim': ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
  'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'],
  'Telangana': ['Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Kumuram Bheem', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal–Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri'],
  'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'],
  'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
  'West Bengal': ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur']
};

const ManageAbout = () => {
  const formRef = useRef(null);
  const messageImageInputRef = useRef(null);
  const geographicImageInputRef = useRef(null);
  const aboutImageInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('about-us');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState({ name: '', position: '', displayOrder: '', message: '', image: '' });
  const [editingMessage, setEditingMessage] = useState(null);
  const [governanceFormData, setGovernanceFormData] = useState({
    title: '',
    hierarchy: createDefaultGovernanceHierarchy(),
    needTitle: 'Need Of Governance',
    needContent: '',
    policyTitle: 'Making Policies & Decisions',
    policyIntro: '',
    policyTiers: createDefaultGovernancePolicyTiers(),
  });
  const [geographicFocusFormData, setGeographicFocusFormData] = useState({
    title: '',
    content: '',
    image: '',
    districts: [],
  });
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [existingActivities, setExistingActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadImageAndSetField = async (file, setter) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const response = await uploadAboutImage(file);
      const imageUrl = response?.data?.imageUrl || '';
      if (!imageUrl) {
        throw new Error('Upload succeeded but no image URL returned');
      }
      setter(imageUrl);
    } catch (error) {
      console.error(error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddDistrict = () => {
    if (selectedState && selectedDistrict) {
      const newDistrict = `${selectedState}-${selectedDistrict}`;
      if (!geographicFocusFormData.districts.includes(newDistrict)) {
        setGeographicFocusFormData({
          ...geographicFocusFormData,
          districts: [...geographicFocusFormData.districts, newDistrict]
        });
      }
      setSelectedState('');
      setSelectedDistrict('');
    }
  };

  const handleRemoveDistrict = (district) => {
    setGeographicFocusFormData({
      ...geographicFocusFormData,
      districts: geographicFocusFormData.districts.filter(d => d !== district)
    });
  };

  const updateGovernancePolicyTier = (index, field, value) => {
    setGovernanceFormData((prev) => {
      const updatedTiers = [...prev.policyTiers];
      updatedTiers[index] = {
        ...updatedTiers[index],
        [field]: value
      };
      return {
        ...prev,
        policyTiers: updatedTiers
      };
    });
  };

  const addGovernancePolicyTier = () => {
    setGovernanceFormData((prev) => ({
      ...prev,
      policyTiers: [...prev.policyTiers, { code: '', title: '', content: '' }]
    }));
  };

  const removeGovernancePolicyTier = (index) => {
    setGovernanceFormData((prev) => {
      const nextTiers = prev.policyTiers.filter((_, tierIndex) => tierIndex !== index);
      return {
        ...prev,
        policyTiers: nextTiers.length > 0 ? nextTiers : createDefaultGovernancePolicyTiers()
      };
    });
  };

  const tabs = useMemo(() => [
    { key: 'about-us', label: 'About Us', fetch: getAboutUs, update: createOrUpdateAboutUs },
    { key: 'geographic-focus', label: 'Geographic Focus', fetch: null, update: null },
    { key: 'messages', label: 'Messages', fetch: null, update: null },
    { key: 'governance', label: 'Governance', fetch: getGovernance, update: createOrUpdateGovernance },
  ], []);

  const fetchData = async (tab) => {
    try {
      const res = await tab.fetch();
      return res.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'messages') {
      const fetchMessages = async () => {
        try {
          const res = await getMessages();
          setMessages(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    } else if (activeTab === 'geographic-focus') {
      const fetchActivities = async () => {
        try {
          const res = await getGeographicActivities();
          setExistingActivities(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchActivities();
    } else {
      const activeTabData = tabs.find((tab) => tab.key === activeTab);
      if (activeTabData && activeTabData.fetch) {
        if (!formData[activeTabData.key]) {
          fetchData(activeTabData).then((data) => {
            if (activeTabData.key === 'governance') {
              const fetchedHierarchy =
                Array.isArray(data?.hierarchy) && data.hierarchy.length > 0
                  ? data.hierarchy
                  : createDefaultGovernanceHierarchy();
              const legacyPolicyTiers = Array.isArray(data?.ethicsPoints)
                ? data.ethicsPoints
                  .map((point, index) => {
                    const fallback = DEFAULT_GOVERNANCE_POLICY_TIERS[index] || {
                      code: `${String.fromCharCode(65 + index)}.)`,
                      title: '',
                      content: ''
                    };
                    return {
                      code: fallback.code,
                      title: fallback.title,
                      content: String(point || '').trim()
                    };
                  })
                  .filter((tier) => tier.content)
                : [];
              const normalizedPolicyTiers =
                Array.isArray(data?.policyTiers) && data.policyTiers.length > 0
                  ? normalizeGovernancePolicyTiers(data.policyTiers)
                  : legacyPolicyTiers.length > 0
                    ? normalizeGovernancePolicyTiers(legacyPolicyTiers)
                    : createDefaultGovernancePolicyTiers();
              setGovernanceFormData({
                title: data?.title || '',
                hierarchy: fetchedHierarchy,
                needTitle: data?.needTitle || data?.ethicsTitle || 'Need Of Governance',
                needContent: data?.needContent || data?.ethicsContent || '',
                policyTitle: data?.policyTitle || 'Making Policies & Decisions',
                policyIntro: data?.policyIntro || '',
                policyTiers: normalizedPolicyTiers,
              });
            } else if (activeTabData.key === 'geographic-focus') {
              setGeographicFocusFormData({
                title: data?.title || '',
                content: data?.content || '',
                image: data?.image || '',
                showMap: data?.showMap || false,
                mapImage: data?.mapImage || '',
              });
            } else {
              setFormData((prev) => ({
                ...prev,
                [activeTabData.key]: {
                  ...DEFAULT_ABOUT_US_FORM,
                  title: data?.title || '',
                  content: data?.content || '',
                  image: data?.image || '',
                  mission: data?.mission || '',
                  vision: data?.vision || ''
                }
              }));
            }
          }).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, [activeTab, tabs, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const activeTabData = tabs.find((tab) => tab.key === activeTab);
      if (activeTabData) {
        let dataToSubmit;
        if (activeTab === 'governance') {
          dataToSubmit = governanceFormData;
        } else if (activeTab === 'geographic-focus') {
          dataToSubmit = geographicFocusFormData;
        } else {
          dataToSubmit = formData[activeTab];
        }
        console.log('Submitting for tab:', activeTab);
        console.log('Form data:', dataToSubmit);
        if (!dataToSubmit) {
          console.error('No form data available for submission');
          alert('No form data available for submission');
          return;
        }
        if (activeTab === 'governance') {
          const normalizedPolicyTiers = (governanceFormData.policyTiers || [])
            .map((tier) => ({
              code: String(tier?.code || '').trim(),
              title: String(tier?.title || '').trim(),
              content: String(tier?.content || '').trim()
            }))
            .filter((tier) => tier.code || tier.title || tier.content);

          const governancePayload = {
            ...governanceFormData,
            needTitle: String(governanceFormData.needTitle || '').trim(),
            needContent: String(governanceFormData.needContent || '').trim(),
            policyTitle: String(governanceFormData.policyTitle || '').trim(),
            policyIntro: String(governanceFormData.policyIntro || '').trim(),
            policyTiers: normalizedPolicyTiers,
            // Legacy fallback payload for older consumers.
            ethicsTitle: String(governanceFormData.needTitle || '').trim(),
            ethicsContent: String(governanceFormData.needContent || '').trim(),
            ethicsPoints: normalizedPolicyTiers
              .map((tier) => [tier.code, tier.title, tier.content].filter(Boolean).join(' '))
              .filter(Boolean)
          };

          await activeTabData.update(governancePayload);
        } else if (activeTab === 'geographic-focus') {
          const districts = geographicFocusFormData.districts.map(d => {
            const [stateCode, districtCode] = d.split('-');
            return { stateCode, districtCode };
          });
          // Validate districts
          const invalidDistricts = districts.filter(d => !d.stateCode || !d.districtCode);
          if (invalidDistricts.length > 0) {
            alert('Invalid district format. Please use format like State-District');
            return;
          }
          if (editingActivity) {
            await updateGeographicActivity(editingActivity._id, {
              name: geographicFocusFormData.title,
              description: geographicFocusFormData.content,
              image: geographicFocusFormData.image || '',
              districts
            });
            setEditingActivity(null);
          } else {
            await createGeographicActivity({
              name: geographicFocusFormData.title,
              description: geographicFocusFormData.content,
              image: geographicFocusFormData.image || '',
              districts
            });
          }
          setGeographicFocusFormData({
            title: '',
            content: '',
            image: '',
            districts: [],
          });
          // Refresh activities
          const res = await getGeographicActivities();
          setExistingActivities(res.data);
        } else {
          await activeTabData.update(formData[activeTab]);
          const updatedData = await fetchData(activeTabData);
          setFormData((prev) => ({
            ...prev,
            [activeTabData.key]: {
              ...DEFAULT_ABOUT_US_FORM,
              title: updatedData?.title || '',
              content: updatedData?.content || '',
              image: updatedData?.image || '',
              mission: updatedData?.mission || '',
              vision: updatedData?.vision || ''
            }
          }));
        }

        alert('Data saved successfully');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = { ...messageForm, displayOrder: parseInt(messageForm.displayOrder, 10) };
      if (editingMessage) {
        await createOrUpdateMessage({ ...formData, _id: editingMessage._id });
      } else {
        await createOrUpdateMessage(formData);
      }
      const res = await getMessages();
      setMessages(res.data);
      setMessageForm({ name: '', position: '', displayOrder: '', message: '', image: '' });
      setEditingMessage(null);
      alert('Message saved successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to save message');
    }
  };

  const handleEditMessage = (message) => {
    setMessageForm({ name: message.name, position: message.position, displayOrder: message.displayOrder, message: message.message, image: message.image });
    setEditingMessage(message);
  };

  const handleDeleteMessage = async (id) => {
    try {
      await deleteMessage(id);
      const res = await getMessages();
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditActivity = (activity) => {
    setGeographicFocusFormData({
      title: activity.name,
      content: activity.description,
      image: activity.image || '',
      districts: activity.districts ? activity.districts.map(d => `${d.stateCode}-${d.districtCode}`) : []
    });
    setEditingActivity(activity);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteGeographicActivity(id);
        alert('Activity deleted successfully');
        // Refresh activities
        const res = await getGeographicActivities();
        setExistingActivities(res.data);
      } catch (error) {
        console.error(error);
        alert('Failed to delete activity');
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage About</h1>
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-4 ${activeTab === tab.key ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {activeTab === 'messages' ? (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Manage Messages</h2>
          <form onSubmit={handleMessageSubmit} className="mb-6">
            <input
              type="text"
              placeholder="Name"
              value={messageForm.name}
              onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Position (e.g., Chairperson)"
              value={messageForm.position}
              onChange={(e) => setMessageForm({ ...messageForm, position: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Display Order"
              value={messageForm.displayOrder}
              onChange={(e) => setMessageForm({ ...messageForm, displayOrder: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <textarea
              placeholder="Message"
              value={messageForm.message}
              onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={messageForm.image}
              onChange={(e) => setMessageForm({ ...messageForm, image: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              ref={messageImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                await uploadImageAndSetField(file, (imageUrl) =>
                  setMessageForm((prev) => ({ ...prev, image: imageUrl }))
                );
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => messageImageInputRef.current?.click()}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 mb-4 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {uploadingImage ? 'Uploading...' : 'Choose Image'}
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              {editingMessage ? 'Update' : 'Add'} Message
            </button>
            {editingMessage && (
              <button
                type="button"
                onClick={() => {
                  setMessageForm({ name: '', position: '', displayOrder: '', message: '', image: '' });
                  setEditingMessage(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
              >
                Cancel
              </button>
            )}
          </form>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message._id} className="bg-gray-100 p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{message.name}</h3>
                  <p className="text-gray-600">{message.position}</p>
                  <p>{message.message}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleEditMessage(message)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'geographic-focus' ? (
        <div className="mb-6">
          <form ref={formRef} onSubmit={handleSubmit} className="mb-6">
            <input
              type="text"
              placeholder="Activity Name"
              value={geographicFocusFormData.title || ''}
              onChange={(e) => setGeographicFocusFormData({ ...geographicFocusFormData, title: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={geographicFocusFormData.content || ''}
              onChange={(e) => setGeographicFocusFormData({ ...geographicFocusFormData, content: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={geographicFocusFormData.image || ''}
              onChange={(e) => setGeographicFocusFormData({ ...geographicFocusFormData, image: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              ref={geographicImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                await uploadImageAndSetField(file, (imageUrl) =>
                  setGeographicFocusFormData((prev) => ({ ...prev, image: imageUrl }))
                );
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => geographicImageInputRef.current?.click()}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 mb-4 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {uploadingImage ? 'Uploading...' : 'Choose Image'}
            </button>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Select Districts</h3>
              <div className="flex space-x-4 mb-4">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('');
                  }}
                  className="p-2 border rounded"
                >
                  <option value="">Select State</option>
                  {Object.keys(indianStatesAndDistricts).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="p-2 border rounded"
                  disabled={!selectedState}
                >
                  <option value="">Select District</option>
                  {selectedState &&
                    indianStatesAndDistricts[selectedState].map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddDistrict}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  disabled={!selectedState || !selectedDistrict}
                >
                  Add District
                </button>
              </div>
              <div className="space-y-2">
                {geographicFocusFormData.districts.map((district, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
                    <span>{district}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDistrict(district)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" disabled={submitting} className="bg-blue-500 text-white px-4 py-2 rounded">
              {editingActivity ? 'Update Activity' : (submitting ? 'Creating...' : 'Create Activity')}
            </button>
            {editingActivity && (
              <button
                type="button"
                onClick={() => {
                  setGeographicFocusFormData({
                    title: '',
                    content: '',
                    image: '',
                    districts: [],
                  });
                  setEditingActivity(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
              >
                Cancel
              </button>
            )}
          </form>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Activities</h3>
            {existingActivities.map((activity) => (
              <div key={activity._id} className="bg-gray-100 p-4 rounded flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{activity.name}</h4>
                  <p className="text-gray-600">{activity.description}</p>
                  <p className="text-sm text-gray-500">Districts: {activity.districts ? activity.districts.map(d => `${d.stateCode}-${d.districtCode}`).join(', ') : ''}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleEditActivity(activity)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'governance' ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            placeholder="Title"
            value={governanceFormData.title || ''}
            onChange={(e) => setGovernanceFormData({ ...governanceFormData, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Organizational Hierarchy</h3>
            <p className="mb-3 text-sm text-gray-600">
              Add each person with their role and photo. You can upload an image or paste a direct image URL.
            </p>
            <HierarchyForm
              hierarchy={governanceFormData.hierarchy}
              onUploadImage={uploadAboutImage}
              onChange={(newHierarchy) => setGovernanceFormData({ ...governanceFormData, hierarchy: newHierarchy })}
            />
          </div>

          <div className="mb-6 rounded border bg-gray-50 p-4">
            <h3 className="mb-3 text-lg font-semibold">Need Of Governance</h3>
            <input
              type="text"
              placeholder="Need Of Governance Title"
              value={governanceFormData.needTitle || ''}
              onChange={(e) => setGovernanceFormData({ ...governanceFormData, needTitle: e.target.value })}
              className="w-full p-2 mb-3 border rounded"
              required
            />
            <textarea
              placeholder="Explain why governance is essential for development work and compliance."
              value={governanceFormData.needContent || ''}
              onChange={(e) => setGovernanceFormData({ ...governanceFormData, needContent: e.target.value })}
              className="w-full p-2 border rounded"
              rows={5}
              required
            />
          </div>

          <div className="mb-6 rounded border bg-gray-50 p-4">
            <h3 className="mb-3 text-lg font-semibold">Making Policies & Decisions</h3>
            <input
              type="text"
              placeholder="Section Title"
              value={governanceFormData.policyTitle || ''}
              onChange={(e) => setGovernanceFormData({ ...governanceFormData, policyTitle: e.target.value })}
              className="w-full p-2 mb-3 border rounded"
              required
            />
            <textarea
              placeholder="Optional introduction for the four-tier policy and decision system."
              value={governanceFormData.policyIntro || ''}
              onChange={(e) => setGovernanceFormData({ ...governanceFormData, policyIntro: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
              rows={3}
            />

            <div className="space-y-4">
              {governanceFormData.policyTiers.map((tier, index) => (
                <div key={`policy-tier-${index}`} className="rounded border bg-white p-3">
                  <div className="mb-2 grid gap-2 md:grid-cols-[120px,1fr]">
                    <input
                      type="text"
                      placeholder="Code (A.)"
                      value={tier.code || ''}
                      onChange={(e) => updateGovernancePolicyTier(index, 'code', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Tier Title"
                      value={tier.title || ''}
                      onChange={(e) => updateGovernancePolicyTier(index, 'title', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Tier details"
                    value={tier.content || ''}
                    onChange={(e) => updateGovernancePolicyTier(index, 'content', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={4}
                    required
                  />
                  {governanceFormData.policyTiers.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeGovernancePolicyTier(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove Tier
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addGovernancePolicyTier}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Tier
            </button>
          </div>
          <button type="submit" disabled={submitting} className="bg-blue-500 text-white px-4 py-2 rounded">
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      ) : loading ? (
        <div className="mb-6">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            placeholder="Title"
            value={formData[activeTab]?.title || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], title: e.target.value } }))}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <textarea
            placeholder="Content"
            value={formData[activeTab]?.content || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], content: e.target.value } }))}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          {activeTab === 'about-us' && (
            <>
              <textarea
                placeholder="Mission"
                value={formData[activeTab]?.mission || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], mission: e.target.value } }))}
                className="w-full p-2 mb-4 border rounded"
                rows={3}
              />
              <textarea
                placeholder="Vision"
                value={formData[activeTab]?.vision || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], vision: e.target.value } }))}
                className="w-full p-2 mb-4 border rounded"
                rows={3}
              />
            </>
          )}
          <input
            type="text"
            placeholder="Image URL"
            value={formData[activeTab]?.image || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], image: e.target.value } }))}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            ref={aboutImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              await uploadImageAndSetField(file, (imageUrl) =>
                setFormData((prev) => ({
                  ...prev,
                  [activeTab]: { ...prev[activeTab], image: imageUrl }
                }))
              );
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={uploadingImage}
            onClick={() => aboutImageInputRef.current?.click()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 mb-4 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {uploadingImage ? 'Uploading...' : 'Choose Image'}
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </form>
      )}
    </div>
  );
};

export default ManageAbout;
