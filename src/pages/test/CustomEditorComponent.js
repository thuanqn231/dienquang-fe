import React, {
    Component,
    forwardRef,
    useState,
    useRef,
    useEffect,
    useImperativeHandle
  } from 'react';
  
  // import DatePicker from 'react-datepicker';
  
  // import 'react-datepicker/dist/react-datepicker.css';
  import moment from 'moment';

  const CustomEditorComponent = forwardRef((props, ref) => {
    const refDatePicker = useRef();
    const [date, setDate] = useState(moment(new Date(), 'YYYY MM DD').toDate());
    const [editing, setEditing] = useState(true);
  
    useEffect(() => {
      if (!editing) {
        props.api.stopEditing();
      }
    }, [editing]);
  
    useImperativeHandle(ref, () => (
      {
        getValue() {
          return moment(date).format('YYYY/MM/DD');
        }
      }
  ));
  
    const onChange = selectedDate => {
      setDate(selectedDate);
      setEditing(false);
    };
  
    return (
      <div>
        {/* <DatePicker
          ref={refDatePicker}
          portalId="root"
          popperClassName="ag-custom-component-popup"
          selected={date}
          dateFormat="yyyy/MM/dd"
          onChange={onChange}
        /> */}
        @TODO use react-datepicker if needed later
      </div>
    );
  });
  
  export default CustomEditorComponent;
  