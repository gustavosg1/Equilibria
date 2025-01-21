import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../firebase/Authentication';

function FeedbackPsychologist() {
  const [averageRate, setAverageRate] = useState(0); // Stores the average rating
  const [reviewCount, setReviewCount] = useState(0); // Stores the total number of reviews
  const [comments, setComments] = useState([]); // Stores the feedback comments
  const db = getFirestore();
  const { user } = useAuth(); // Get authenticated user

  useEffect(() => {
    // Fetch feedback data from Firestore using the authenticated user's ID
    const fetchFeedback = async () => {
      if (user && user.uid) {
        try {
          const feedbackDoc = await getDoc(doc(db, 'reviews', user.uid)); // Use the authenticated user's ID
          if (feedbackDoc.exists()) {
            const feedbackData = feedbackDoc.data().reviews || []; // Extract reviews array
            const totalRate = feedbackData.reduce((sum, review) => sum + review.rate, 0); // Sum all ratings
            setAverageRate(feedbackData.length > 0 ? totalRate / feedbackData.length : 0); // Calculate average rating
            setReviewCount(feedbackData.length); // Update total reviews count
            setComments(feedbackData.map(review => review.comment)); // Extract comments from feedback
          }
        } catch (error) {
          console.error('Error fetching feedback:', error);
        }
      }
    };

    fetchFeedback();
  }, [db, user]); // Dependencies include Firestore instance and authenticated user

  return (
    <Grid
      sx={{        
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#f9f9f9',
        paddingTop: '30px',
        borderRadius: 2,
        boxShadow: 3,
        width: '100%',
        height: '120%',
        overflowY: 'auto',

      }}
    >
      {/* Average rating displayed at the top */}
      <Typography variant="caption" sx={{ mb: 1, color: 'gray' }}>
        Média: {averageRate.toFixed(1)}
      </Typography>

      {/* Star ratings based on average */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        {[...Array(5)].map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: index < Math.round(averageRate) ? '#ffc107' : '#e0e0e0',
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              mr: 0.5,
            }}
          />
        ))}
      </Box>

      {/* Total number of reviews */}
      <Typography variant="body2" sx={{ color: 'gray', mb: 3 }}>
        {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
      </Typography>

      {/* Feedback comments */}
      <Grid container spacing={2} sx={{ width: '90%' }}>
        {comments.map((comment, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: '#fff',
                borderRadius: 1,
                boxShadow: 2,
                minHeight: 100,
              }}
            >
              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                "{comment}"
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}

export default FeedbackPsychologist;
