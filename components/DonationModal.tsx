import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { X, Heart, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface DonationModalProps {
  visible: boolean;
  onClose: () => void;
  mosqueName: string;
  stripePublishableKey?: string;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  visible,
  onClose,
  mosqueName,
  stripePublishableKey,
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedAmounts = [10, 25, 50, 100];

  const handleDonation = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
      return;
    }

    if (!stripePublishableKey) {
      Alert.alert('Donation Unavailable', 'Donation is not available for this mosque at the moment.');
      return;
    }

    setIsProcessing(true);

    try {
      // In a real app, you would integrate with Stripe here
      // For now, we'll simulate the donation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Donation Successful',
        `Thank you for your generous donation of $${amount} to ${mosqueName}. May Allah reward you for your kindness.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Donation Failed', 'There was an error processing your donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Donate to {mosqueName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Heart size={48} color={Colors.primary} fill={Colors.primary} />
          </View>

          <Text style={styles.description}>
            Your donation helps support the mosque's activities, maintenance, and community programs.
            Every contribution makes a difference.
          </Text>

          <Text style={styles.sectionTitle}>Select Amount</Text>
          <View style={styles.predefinedAmounts}>
            {predefinedAmounts.map((preAmount) => (
              <TouchableOpacity
                key={preAmount}
                style={[
                  styles.amountButton,
                  amount === preAmount.toString() && styles.selectedAmountButton,
                ]}
                onPress={() => setAmount(preAmount.toString())}
              >
                <Text
                  style={[
                    styles.amountButtonText,
                    amount === preAmount.toString() && styles.selectedAmountButtonText,
                  ]}
                >
                  ${preAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Custom Amount</Text>
          <View style={styles.inputContainer}>
            <DollarSign size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[styles.donateButton, isProcessing && styles.disabledButton]}
            onPress={handleDonation}
            disabled={isProcessing}
          >
            <Text style={styles.donateButtonText}>
              {isProcessing ? 'Processing...' : `Donate $${amount || '0'}`}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            This is a secure donation powered by Stripe. Your payment information is encrypted and protected.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
  },
  predefinedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  amountButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  selectedAmountButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedAmountButtonText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    marginBottom: 30,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  donateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  donateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});