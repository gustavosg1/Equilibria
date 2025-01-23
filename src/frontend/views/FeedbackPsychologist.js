import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Rating, CircularProgress, styled } from '@mui/material';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../backend/config/Authentication';

const FeedbackCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  minHeight: 140,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4]
  }
}));

function FeedbackPsychologist() {
  const [averageRate, setAverageRate] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const db = getFirestore();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        if (user?.uid) {
          const feedbackDoc = await getDoc(doc(db, 'reviews', user.uid));
          if (feedbackDoc.exists()) {
            const feedbackData = feedbackDoc.data().reviews || [];
            const totalRate = feedbackData.reduce((sum, review) => sum + review.rate, 0);
            setAverageRate(feedbackData.length > 0 ? totalRate / feedbackData.length : 0);
            setReviewCount(feedbackData.length);
            setComments(feedbackData.map(review => review.comment));
          }
        }
      } catch (error) {
        setError('Error al cargar las reseñas');
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [db, user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center" mt={4}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{
      p: 4,
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)'
    }}>
      <Paper elevation={0} sx={{
        p: 4,
        borderRadius: 4,
        boxShadow: '0px 8px 24px rgba(149, 157, 165, 0.1)'
      }}>
        {/* Header Section */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2e7d32 30%, #388e3c 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Mis Reseñas
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Rating
              value={averageRate}
              precision={0.1}
              readOnly
              sx={{ fontSize: '2.5rem', color: '#ffc107' }}
            />
            <Typography variant="h6" color="text.secondary">
              ({averageRate.toFixed(1)}/5.0)
            </Typography>
          </Box>
          
          <Typography variant="body1" color="success.main" sx={{ mt: 1 }}>
            {reviewCount} {reviewCount === 1 ? 'evaluación' : 'evaluaciones'}
          </Typography>
        </Box>

        {/* Comments Grid */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {comments.map((comment, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeedbackCard elevation={0}>
                <Typography variant="body1" sx={{
                  fontStyle: 'italic',
                  textAlign: 'center',
                  color: 'text.secondary',
                  position: 'relative',
                  '&:before, &:after': {
                    content: '"\\201C"',
                    fontSize: '2rem',
                    color: 'success.light',
                    position: 'absolute',
                  },
                  '&:before': { left: -10, top: -10 },
                  '&:after': { right: -10, bottom: -10 }
                }}>
                  {comment}
                </Typography>
              </FeedbackCard>
            </Grid>
          ))}
        </Grid>

        {comments.length === 0 && (
          <Typography variant="body1" textAlign="center" sx={{ mt: 4, color: 'text.secondary' }}>
            Aún no tienes evaluaciones
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default FeedbackPsychologist;