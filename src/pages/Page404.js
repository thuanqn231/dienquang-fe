import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
// material
import { styled } from '@material-ui/core/styles';
import { Box, Button, Typography, Container } from '@material-ui/core';
// components
import { MotionContainer, varBounceIn } from '../components/animate';
import Page from '../components/Page';
import { PageNotFoundIllustration } from '../assets';
import useLocales from '../hooks/useLocales';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10)
}));

// ----------------------------------------------------------------------

export default function Page404() {
  const { translate } = useLocales();
  return (
    <RootStyle title="404 Page Not Found | Điện Quang">
      <Container>
        <MotionContainer initial="initial" open>
          <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
            <motion.div variants={varBounceIn}>
              <Typography variant="h3" paragraph>
                {translate(`typo.sorry_page_not_found`)}
              </Typography>
            </motion.div>
            <Typography sx={{ color: 'text.secondary' }}>
              {translate(
                `typo.sorry_we_couldn’t_find_the_page_you’re_looking_for_perhaps_you’ve_mistyped_the_URL_be_sure_to_check_your_spelling`
              )}
            </Typography>

            <motion.div variants={varBounceIn}>
              <PageNotFoundIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
            </motion.div>

            <Button to="/pages/C002000" size="large" variant="contained" component={RouterLink}>
              {translate(`button.go_to_home`)}
            </Button>
          </Box>
        </MotionContainer>
      </Container>
    </RootStyle>
  );
}
