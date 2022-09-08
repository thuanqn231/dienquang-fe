import { Box, Divider } from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import { isUndefined } from 'lodash';
import { isEmpty } from 'lodash-es';
//
import Markdown from '../../components/Markdown';
import Scrollbar from '../../components/Scrollbar';
// redux
import { useSelector } from '../../redux/store';
import ApprovalDetailsAttachFile from './ApprovalDetailsAttachFile';
import ApprovalDetailsAttachments from './ApprovalDetailsAttachments';
import ApprovalDetailsInfo from './ApprovalDetailsInfo';
import ApprovalDetailsPath from './ApprovalDetailsPath';
import ApprovalDetailsTitle from './ApprovalDetailsTitle';
import ApprovalDetailsToolbar from './ApprovalDetailsToolbar';

// ----------------------------------------------------------------------

const RootStyle = styled('div')({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
});

const MarkdownWrapperStyle = styled('div')(({ theme }) => ({
    '& > p': {
        ...theme.typography.body1,
        marginBottom: theme.spacing(2)
    }
}));

// ----------------------------------------------------------------------

export default function ApprovalDetail() {
    const approval = useSelector((state) => state.approval.approval);
    const isAttached = approval && !isUndefined(approval.files) && approval.files.length > 0;
    if (isEmpty(approval)) {
        return null;
    }

    return (
        <RootStyle>
            <ApprovalDetailsToolbar />
            <ApprovalDetailsTitle approval={approval} />
            <ApprovalDetailsInfo approval={approval} />
            <Divider />
            <Scrollbar sx={{ flexGrow: 1 }}>
                <ApprovalDetailsPath approval={approval} />
                <Divider />
                <ApprovalDetailsAttachFile approval={approval} />
                <Divider />
                <Box sx={{ p: { xs: 3, md: 5 } }}>
                    <MarkdownWrapperStyle>
                        <Markdown children={approval.htmlContent} />
                    </MarkdownWrapperStyle>
                </Box>
                {isAttached && <ApprovalDetailsAttachments approval={approval} />}
            </Scrollbar>
        </RootStyle>
    );
}
