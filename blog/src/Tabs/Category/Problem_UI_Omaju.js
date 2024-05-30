import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ProblemUI({ categoryName }) {
  const [quizDataList, setQuizDataList] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalDislikes, setTotalDislikes] = useState(0);
  const [showNoProblemDialog, setShowNoProblemDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchQuizData(categoryName);
  }, [categoryName]);

  const fetchAllQuizData = async (quizIds) => {
    try {
      const quizDataArray = await Promise.all(
        quizIds.map(async (quizId) => {
          const response = await axios.get(`https://valanse.site/quiz/${quizId}`);
          return response.data.data;
        })
      );
      return quizDataArray;
    } catch (error) {
      console.error('Error fetching quiz data:', error.message);
      return [];
    }
  };

  const fetchQuizData = async (category) => {
    try {
      const response = await axios.get(
        `https://valanse.site/quiz-category/search?keyword=${encodeURIComponent(category)}`
      );
      const data = response.data.data;
      if (!data || data.length === 0) {
        setShowNoProblemDialog(true);
        return;
      }
      const quizIds = data.map((quiz) => quiz.quizId);
      const quizDataArray = await fetchAllQuizData(quizIds);
      setQuizDataList(quizDataArray);
    } catch (error) {
      console.error('Error fetching quiz data:', error.message);
      setShowNoProblemDialog(true);
    }
  };

  const fetchLikeStats = async (quizId) => {
    try {
      const response = await axios.get(`https://valanse.site/quiz/${quizId}/like-stats`);
      const { likeCount, unlikeCount } = response.data;
      setTotalLikes(likeCount);
      setTotalDislikes(unlikeCount);
    } catch (error) {
      console.error('Error fetching like stats:', error.message);
    }
  };

  const handleOptionSelect = async (option, quizId) => {
    setSelectedOption(option);
    setShowConfirmDialog(true);
    await fetchLikeStats(quizId); // 선택된 퀴즈의 좋아요 및 싫어요 통계를 가져옴
    console.log(quizDataList[currentQuizIndex]); // 선택한 퀴즈의 상세 정보 출력
  };

  const handleOptionLike = async () => {
    const currentQuiz = quizDataList[currentQuizIndex];
    try {
      const response = await axios.post(`https://valanse.site/quiz/${currentQuiz.quizId}/increase-preference`);
      setTotalLikes(totalLikes + 1);
    } catch (error) {
      console.error('Error updating preference:', error.message);
    }
  };

  const handleOptionDislike = async () => {
    const currentQuiz = quizDataList[currentQuizIndex];
    try {
      const response = await axios.post(`https://valanse.site/quiz/${currentQuiz.quizId}/decrease-preference`);
      setTotalDislikes(totalDislikes + 1);
    } catch (error) {
      console.error('Error updating preference:', error.message);
    }
  };

  const handleNext = async () => {
    const nextIndex = currentQuizIndex + 1;
    if (nextIndex < quizDataList.length) {
      setCurrentQuizIndex(nextIndex);
    } else {
      setShowNoProblemDialog(true);
    }
  };

  const handlePrevious = () => {
    const previousIndex = currentQuizIndex - 1;
    if (previousIndex >= 0) {
      setCurrentQuizIndex(previousIndex);
    }
  };

  const handleCloseNoProblemDialog = () => {
    setShowNoProblemDialog(false);
  };

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  const handleConfirmSelection = () => {
    setShowConfirmDialog(false); // 다이얼로그를 닫기
    handleNext(); // 다음 퀴즈로 넘어가버리기
  };

  const currentQuizData = quizDataList[currentQuizIndex];

  return (
    <Container maxWidth="lg">
      <Dialog
        open={showNoProblemDialog}
        onClose={handleCloseNoProblemDialog}
        aria-labelledby="no-problem-dialog-title"
        aria-describedby="no-problem-dialog-description"
      >
        <DialogTitle id="no-problem-dialog-title">문제가 없습니다.</DialogTitle>
        <DialogContent>
          <Typography variant="body1" id="no-problem-dialog-description">
            현재 문제가 더 이상 제공되지 않습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoProblemDialog} color="primary">
            확인
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">선택 확인</DialogTitle>
        <DialogContent>
          <Typography variant="body1" id="confirm-dialog-description">
            선택지: {selectedOption}. 정말 선택하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            취소
          </Button>
          <Button onClick={handleConfirmSelection} color="primary" autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
      <Card sx={{ bgcolor: '#f5f5f5', borderRadius: '16px', mt: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            <Griditem xs={12} style={{ height: '30px' }} />
            <Grid item xs={12}>
              <Typography variant="h4" align="center">{currentQuizData ? currentQuizData.content : ''}</Typography>
            </Grid>
            <Grid item xs={12} textAlign="center">
              <IconButton onClick={handleOptionLike}>
                <ThumbUpIcon color={'inherit'} /> {totalLikes}
              </IconButton>
              <IconButton onClick={handleOptionDislike}>
                <ThumbDownIcon color={'inherit'} /> {totalDislikes}
              </IconButton>
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Typography variant="h6">추천 통계</Typography>
              <Typography variant="body1">좋아요: {totalLikes}</Typography>
              <Typography variant="body1">싫어요: {totalDislikes}</Typography>
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Card onClick={() => handleOptionSelect('A', currentQuizData.quizId)} sx={{ borderRadius: '16px' }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="400"
                    image={currentQuizData ? currentQuizData.imageA : ''}
                    alt=""
                  />
                  <CardContent sx={{ height: '100px' }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {currentQuizData ? currentQuizData.descriptionA : ''}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Card onClick={() => handleOptionSelect('B', currentQuizData.quizId)} sx={{ borderRadius: '16px' }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="400"
                    image={currentQuizData ? currentQuizData.imageB : ''}
                    alt=""
                  />
                  <CardContent sx={{ height: '100px' }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {currentQuizData ? currentQuizData.descriptionB : ''}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handlePrevious}
                disabled={currentQuizIndex === 0}
                startIcon={<ArrowBackIcon />}
              >
                Previous
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Card>
    </Container>
  );
}

export default ProblemUI;