import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { getFirestore, collection, getDocs } from '@react-native-firebase/firestore';
import moment from 'moment'; // For date manipulation

const SalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const db = getFirestore();

  // Helper function to check if the order is from today
  const isToday = (date) => moment(date).isSame(moment(), 'day');

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        // Fetch product data from 'datacolnew' collection
        const datacollection = collection(db, 'datacolnew');
        const productSnapshot = await getDocs(datacollection);
        const fetchedProducts = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSalesData(fetchedProducts);

        // Fetch sales data from 'salesInfo' collection
        const salesCollection = collection(db, 'salesInfo');
        const salesSnapshot = await getDocs(salesCollection);
        const fetchedSales = salesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Separate today's orders and previous orders
        const today = [];
        const previous = [];
        fetchedSales.forEach(order => {
          if (isToday(order.timestamp)) {
            today.push(order);
          } else {
            previous.push(order);
          }
        });

        setTodayOrders(today);
        setPreviousOrders(previous);

      } catch (error) {
        console.error('Error fetching sales data: ', error);
        Alert.alert('Error', 'Failed to fetch sales data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const generateCSV = async () => {
    try {
      // CSV header for product data
      const productHeader = ['Product Name', 'Stock Left', 'Sold Today', 'Supplier', 'Commission', 'Total Commission'];
      const productData = salesData.map((product) => {
        const soldToday = product.qtySoldToday || 0;
        const commission = product.commission || 0;
        const totalCommission = soldToday * commission;

        return [
          product.name,
          product.qty || 0,
          soldToday,
          product.supname || 'Unknown',
          commission,
          totalCommission.toFixed(2),
        ];
      });

      // CSV header for today's orders
      const todayOrderHeader = ['Customer Name', 'Customer Mobile', 'Customer Address', 'Invoice No', 'Product Name', 'Product ID', 'Price', 'Supplier', 'Quantity Sold', 'Total Amount', 'Date'];
      const todayOrderData = todayOrders.flatMap((order) =>
        order.products.map((product) => [
          order.customerName,
          order.customerMobile,
          order.customerAddress,
          order.invoiceNo,
          product.name,
          product.productId,
          product.price,
          product.supname || 'Unknown',
          product.qty,
          order.totalAmount,
          moment(order.timestamp).format('YYYY-MM-DD'),
        ])
      );

      // CSV header for previous orders
      const previousOrderHeader = ['Customer Name', 'Customer Mobile', 'Customer Address', 'Invoice No', 'Product Name', 'Product ID', 'Price', 'Supplier', 'Quantity Sold', 'Total Amount', 'Date'];
      const previousOrderData = previousOrders.flatMap((order) =>
        order.products.map((product) => [
          order.customerName,
          order.customerMobile,
          order.customerAddress,
          order.invoiceNo,
          product.name,
          product.productId,
          product.price,
          product.supname || 'Unknown',
          product.qty,
          order.totalAmount,
          moment(order.timestamp).format('YYYY-MM-DD'),
        ])
      );

      // Combine all CSV data
      const csvContent = [
        ['Product Data'], // Section for product data
        productHeader,
        ...productData,
        [], // Empty row as separator
        ["Today's Orders"], // Section for today's orders
        todayOrderHeader,
        ...todayOrderData,
        [], // Empty row as separator
        ['Previous Orders'], // Section for previous orders
        previousOrderHeader,
        ...previousOrderData
      ].map((row) => row.join(',')).join('\n');

      // Define the file path to the Downloads folder
      const path = `${RNFS.DownloadDirectoryPath}/sales_report_${moment().format('YYYYMMDD')}.csv`;

      // Write the CSV file
      await RNFS.writeFile(path, csvContent, 'utf8');

      // Share the file
      await Share.open({
        title: 'Sales Report',
        url: `file://${path}`,
        type: 'text/csv',
      });

      Alert.alert('Success', 'Sales report generated and saved to Downloads folder!');
    } catch (error) {
      // console.error('Error generating sales report: ', error);
      // Alert.alert('Error', 'Failed to generate sales report.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales Report</Text>
      <Button title="Generate Sales Report" onPress={generateCSV} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
});

export default SalesReport;
