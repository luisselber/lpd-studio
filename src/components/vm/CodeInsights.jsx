import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Avatar,
  Wrap,
  WrapItem,
  Center,
  Flex
} from '@chakra-ui/react';
import { executeCode } from '../../api';
import { LuCode2, LuCode, LuFileDigit, LuFileTerminal } from "react-icons/lu";
import { RiIndeterminateCircleLine } from "react-icons/ri";
import { GrClearOption } from "react-icons/gr";
import { useHotkeys } from 'react-hotkeys-hook';

const CodeInsights = ({ editorRef }) => {
  const toast = useToast();
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const labelCount = (editorRef.current?.getValue().match(/NULL/g) || []).length;
  const functionCount = (editorRef.current?.getValue().match(/CALL/g) || []).length;
  const variableCount = editorRef.current?.getValue()
    .split('\n')
    .filter(line => line.trim().startsWith('ALLOC'))
    .reduce((sum, line) => {
      const [cmd, base, count] = line.trim().split(/\s+/);
      return sum + parseInt(count, 10);
    }, 0) || 0;
  const readCount = (editorRef.current?.getValue().match(/RD/g) || []).length;
  const writeCount = (editorRef.current?.getValue().match(/PRN/g) || []).length;

  const renderOutput = () => {
    return (
      <Accordion allowMultiple mt={3}>
        <Wrap mb={5}>
          <WrapItem>
            <Flex align="center">
              <Avatar name='Dan Abrahmov' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsR9zEOASbdiOEFfcEW0q5BwS5dT10S2APRw&s' />
              <Text ml={3}>
                Assembly Didático
              </Text>
            </Flex>
          </WrapItem>
        </Wrap>

        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Subprogramas
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel pb={4}>
            <Text>
              <strong>Rótulos:</strong> {labelCount}
            </Text>
            <Text>
              <strong>Chamadas de Funções/Procedimentos:</strong> {functionCount}
            </Text>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Variáveis
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel pb={4}>
            <Text>
              <strong>Var count:</strong> {variableCount}
            </Text>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Operações de IO
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel pb={4}>
            <Text>
              <strong>Leitura:</strong> {readCount}
            </Text>
            <Text>
              <strong>Escrita:</strong> {writeCount}
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  return (
    <Box w="100%" borderWidth={1} borderColor="gray.600" borderRadius="md">
      <Text mt={4} mb={4} ml={5} fontSize="lg">
        Code Insights
      </Text>

      <Box
        height="85vh"
        p={2}
        border="1px solid"
        borderRadius={4}
        borderColor="#333"
        overflowY="auto"
      >
        {renderOutput()}
      </Box>
    </Box>
  );
};

export default CodeInsights;