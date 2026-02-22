// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   Animated,
//   Dimensions,
//   Alert,
// } from 'react-native';
// import { useState, useRef, useEffect } from 'react';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { useRouter } from 'expo-router';
// import { useAuth } from '../contexts/AuthContext';

// const { width } = Dimensions.get('window');

// interface ProfileMenuProps {
//   visible: boolean;
//   onClose: () => void;
// }

// export default function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
//   const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;
//   const router = useRouter();
//   const { user, logout } = useAuth();

//   useEffect(() => {
//     if (visible) {
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         useNativeDriver: true,
//         tension: 65,
//         friction: 11,
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: -width * 0.75,
//         duration: 250,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [visible]);

//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Logout',
//           style: 'destructive',
//           onPress: async () => {
//             onClose();
//             await logout();
//           },
//         },
//       ]
//     );
//   };

//   const handleLogin = () => {
//     onClose();
//     router.push('/auth/login');
//   };

//   if (!visible) return null;

//   return (
//     <Modal
//       transparent
//       visible={visible}
//       animationType="none"
//       onRequestClose={onClose}
//     >
//       {/* Backdrop */}
//       <TouchableOpacity
//         style={styles.backdrop}
//         activeOpacity={1}
//         onPress={onClose}
//       >
//         {/* Menu Panel */}
//         <Animated.View
//           style={[
//             styles.menuPanel,
//             { transform: [{ translateX: slideAnim }] },
//           ]}
//           onStartShouldSetResponder={() => true}
//         >
//           {/* Header */}
//           <View style={styles.header}>
//             <Ionicons name="person-circle" size={32} color="white" />
//             <Text style={styles.headerTitle}>Profile</Text>
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <Ionicons name="close" size={24} color="white" />
//             </TouchableOpacity>
//           </View>

//           {/* User Info Section */}
//           <View style={styles.userSection}>
//             <View style={styles.avatarContainer}>
//               <Text style={styles.avatarText}>
//                 {user?.anonymousUsername?.charAt(0) || '?'}
//               </Text>
//             </View>
//             {user ? (
//               <>
//                 <Text style={styles.username}>{user.anonymousUsername}</Text>
//                 <Text style={styles.userEmail}>{user.email}</Text>
//               </>
//             ) : (
//               <>
//                 <Text style={styles.username}>Guest User</Text>
//                 <Text style={styles.userEmail}>Not logged in</Text>
//               </>
//             )}
//           </View>

//           {/* Menu Items */}
//           <View style={styles.menuItems}>
//             <TouchableOpacity style={styles.menuItem}>
//               <Ionicons name="settings-outline" size={24} color="#333" />
//               <Text style={styles.menuItemText}>Settings</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.menuItem}>
//               <Ionicons name="help-circle-outline" size={24} color="#333" />
//               <Text style={styles.menuItemText}>Help & Support</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.menuItem}>
//               <Ionicons name="information-circle-outline" size={24} color="#333" />
//               <Text style={styles.menuItemText}>About</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Login/Logout Button */}
//           <View style={styles.authSection}>
//             {user ? (
//               <TouchableOpacity 
//                 style={[styles.loginButton, styles.logoutButton]}
//                 onPress={handleLogout}
//               >
//                 <Ionicons name="log-out-outline" size={20} color="white" />
//                 <Text style={styles.loginButtonText}>Logout</Text>
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity 
//                 style={styles.loginButton}
//                 onPress={handleLogin}
//               >
//                 <Ionicons name="log-in-outline" size={20} color="white" />
//                 <Text style={styles.loginButtonText}>Login / Sign Up</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Footer */}
//           <View style={styles.footer}>
//             <Text style={styles.footerText}>GatorFamily v1.0</Text>
//             <Text style={styles.footerSubtext}>Made with 💜 at WiNGHacks 2026</Text>
//           </View>
//         </Animated.View>
//       </TouchableOpacity>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   backdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   menuPanel: {
//     position: 'absolute',
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: width * 0.75,
//     backgroundColor: 'white',
//     shadowColor: '#000',
//     shadowOffset: { width: 2, height: 0 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   header: {
//     backgroundColor: '#8B5CF6',
//     paddingTop: 60,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     flex: 1,
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//     marginLeft: 12,
//   },
//   closeButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   userSection: {
//     alignItems: 'center',
//     paddingVertical: 30,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   avatarContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#8B5CF6',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   avatarText: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   username: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   userEmail: {
//     fontSize: 14,
//     color: '#666',
//   },
//   menuItems: {
//     paddingVertical: 20,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//   },
//   menuItemText: {
//     fontSize: 16,
//     color: '#333',
//     marginLeft: 16,
//   },
//   authSection: {
//     paddingHorizontal: 20,
//     marginTop: 'auto',
//     paddingBottom: 20,
//   },
//   loginButton: {
//     flexDirection: 'row',
//     backgroundColor: '#8B5CF6',
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoutButton: {
//     backgroundColor: '#ff4444',
//   },
//   loginButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   footer: {
//     alignItems: 'center',
//     paddingBottom: 30,
//   },
//   footerText: {
//     fontSize: 12,
//     color: '#999',
//   },
//   footerSubtext: {
//     fontSize: 11,
//     color: '#bbb',
//     marginTop: 4,
//   },
// });

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
// 🚀 Adjust this path if your generator is in a different folder
import { generateAnonymousUsername } from '../utils/usernameGenerator';
const { width } = Dimensions.get('window');

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // 🚀 State for the guest name
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    if (visible) {
      // 🚀 Generate initial guest name if not logged in
      if (!user && !guestName) {
        setGuestName(generateAnonymousUsername());
      }

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width * 0.75,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await logout();
            setGuestName(''); // Reset guest name on logout
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    onClose();
    router.push('/auth/login');
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Menu Panel */}
        <Animated.View
          style={[
            styles.menuPanel,
            { transform: [{ translateX: slideAnim }] },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="person-circle" size={32} color="white" />
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* User Info Section */}
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user ? user.anonymousUsername?.charAt(0) : guestName.charAt(0) || '?'}
              </Text>
            </View>
            
            <View style={styles.nameRow}>
              <Text style={styles.username}>
                {user ? user.anonymousUsername : guestName || 'Guest User'}
              </Text>
              
              {/* 🚀 Refresh button for Guest users */}
              {!user && (
                <TouchableOpacity 
                  onPress={() => setGuestName(generateAnonymousUsername())}
                  style={styles.refreshButton}
                >
                  <Ionicons name="refresh-circle" size={24} color="#8B5CF6" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.userEmail}>
              {user ? user.email : 'Browsing as Guest'}
            </Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="settings-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="help-circle-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="information-circle-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>About</Text>
            </TouchableOpacity>
          </View>

          {/* Login/Logout Button */}
          <View style={styles.authSection}>
            {user ? (
              <TouchableOpacity 
                style={[styles.loginButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text style={styles.loginButtonText}>Logout</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Ionicons name="log-in-outline" size={20} color="white" />
                <Text style={styles.loginButtonText}>Login / Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>GatorFamily v1.0</Text>
            <Text style={styles.footerSubtext}>Made with 💜 at WiNGHacks 2026</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  refreshButton: {
    marginLeft: 8,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuItems: {
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  authSection: {
    paddingHorizontal: 20,
    marginTop: 'auto',
    paddingBottom: 20,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 4,
  },
});